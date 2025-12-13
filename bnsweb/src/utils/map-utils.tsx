import { camerautils } from '@/utils/camera-utils';
import * as gateutils from '@/utils/gate-utils';
import * as waterutils from '@/utils/water-utils';
import * as ebrdutils from '@/utils/ebrd-utils';
import * as emcallutils from '@/utils/emcall-utils';
import 'ol/ol.css';
import axios from 'axios';
import { Map as MapMap, Overlay } from 'ol';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import Geometry from 'ol/geom/Geometry';
import { Fill, Icon, Stroke, Style, Text, Circle } from 'ol/style';
// import { toast } from 'sonner';
import { IfTbCamera } from '@/models/tb_camera';
import { IfTbGate } from '@/models/gate/tb_gate';
import { IfTbWater } from '@/models/water/tb_water';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import { Draw, Snap } from 'ol/interaction';
import { gconf } from '@/utils/gconf';
import { useSysConfStore } from '@/store/useSysConf';
import { IfTbEmcallGrp } from '@/models/emcall/tb_emcall_grp';

// 바운스 애니메이션 변수
let direction: number = 1; // 1: 올라감, -1: 내려감
let currentY: number = 0; // 현재 Y 좌표
let animationFrameId: number = 0; // 애니메이션 프레임 ID

// Pulse 애니메이션 변수
let pulseRadius: number = 1;
let pulseOpacity: number = 1;
let pulseAnimationId: number = 0;
let pulseLayer: VectorLayer<VectorSource> | null = null;

function setAnimBounce(_zoom?: number) {
  let bounceHeight: number = 0; // 바운스 높이
  let bounceSpeed: number = 0; // 바운스 속도

  // if (zoom > 18) {
  //   bounceHeight = 0.05;
  //   bounceSpeed = 0.001;
  // } else if (zoom > 17 && zoom <= 18) {
  //   bounceHeight = 0.18;
  //   bounceSpeed = 0.004;
  // } else if (zoom > 15 && zoom <= 17) {
  //   bounceHeight = 0.3;
  //   bounceSpeed = 0.008;
  // } else if (zoom > 12 && zoom <= 15) {
  //   bounceHeight = 3;
  //   bounceSpeed = 0.05;
  // } else if (zoom < 12) {
  //   bounceHeight = 100;
  //   bounceSpeed = 2;
  // }

  bounceHeight = 0.2;
  bounceSpeed = 0.005;
  return [bounceHeight, bounceSpeed];
}

// 마커 bounce 애니메이션 함수
function animBounceMarker(map: MapMap, marker: Feature<Point>) {
  const coordinates = marker?.getGeometry()?.getCoordinates();
  const zoomLevel = map.getView().getZoom() || 18;
  // console.log('zoomLevel', zoomLevel);
  const [bounceHeight, bounceSpeed] = setAnimBounce(zoomLevel);

  currentY += direction * bounceSpeed;

  // Y좌표 업데이트
  if (currentY >= bounceHeight) {
    currentY = bounceHeight;
    direction = -1;
  } else if (currentY <= -bounceHeight) {
    currentY = -bounceHeight;
    direction = 1;
  }

  // 새로운 좌표 설정
  if (coordinates)
    marker?.getGeometry()?.setCoordinates([coordinates[0], coordinates[1] + currentY]);

  // 애니메이션 프레임 요청
  animationFrameId = requestAnimationFrame(() => animBounceMarker(map, marker));
}

// 마커 pulse 애니메이션 함수
export function animPulseMarker(map: MapMap, marker: Feature<Point>) {
  const coordinates = marker?.getGeometry()?.getCoordinates();
  if (!coordinates) return;

  // 기존 pulse 레이어 제거
  if (pulseLayer) {
    map.removeLayer(pulseLayer);
  }

  // 새로운 pulse 레이어 생성
  const pulseFeature = new Feature({
    geometry: new Point(coordinates),
  });

  const pulseStyle = new Style({
    image: new Circle({
      radius: pulseRadius,
      fill: new Fill({
        color: `rgba(255, 105, 180, ${pulseOpacity})`,
      }),
      stroke: new Stroke({
        color: `rgba(255, 105, 180, ${pulseOpacity * 0.8})`,
        width: 2,
      }),
    }),
  });

  pulseFeature.setStyle(pulseStyle);

  const source = new VectorSource({
    features: [pulseFeature],
  });

  pulseLayer = new VectorLayer({
    source: source,
    zIndex: 1000,
  });

  map.addLayer(pulseLayer);

  // 애니메이션 함수
  const animate = () => {
    if (!pulseLayer) return;

    const newStyle = new Style({
      image: new Circle({
        radius: pulseRadius,
        fill: new Fill({
          color: `rgba(255, 105, 180, ${pulseOpacity})`,
        }),
        stroke: new Stroke({
          color: `rgba(255, 105, 180, ${pulseOpacity * 0.8})`,
          width: 2,
        }),
      }),
    });

    pulseFeature.setStyle(newStyle);

    pulseRadius += 3;
    pulseOpacity -= 0.03;

    if (pulseRadius > 100 || pulseOpacity <= 0) {
      pulseRadius = 0;
      pulseOpacity = 1;
    }

    pulseAnimationId = requestAnimationFrame(animate);
  };

  // 애니메이션 시작
  animate();
}

export function stopPulseAnimation(map: MapMap) {
  if (pulseAnimationId) {
    cancelAnimationFrame(pulseAnimationId);
    if (pulseLayer) {
      map.removeLayer(pulseLayer);
      pulseLayer = null;
    }
    pulseRadius = 0;
    pulseOpacity = 1;
  }
}

const fetchCameraData = async (url: string) => {
  const { data } = await axios.get(url);
  return data;
};

// VWorld Map Url
// Base: 기본지도, gray: 백지도, midnight: 야간지도, Hybrid: 하이브리드 지도, Satellite: 위성지도
export const getMapUrl = (type?: string) => {
  const conf = useSysConfStore.getState()?.sysConf;
  if (conf?.use_offline_map_yn === 'Y') {
    return `${conf?.url_offline_map}/tiles/{z}/{x}/{y}.png`;
  }
  if (type) return `http://api.vworld.kr/req/wmts/1.0.0/${getApiKey()}/${type}/{z}/{y}/{x}.png`;
  else return getBaseUrl();
};

// VWorld Base Map Url
export const getBaseUrl = () => {
  const conf = useSysConfStore.getState()?.sysConf;
  if (conf?.use_offline_map_yn === 'Y') {
    return `${conf?.url_offline_map}/tiles/{z}/{x}/{y}.png`;
  }
  return `http://api.vworld.kr/req/wmts/1.0.0/${getApiKey()}/Base/{z}/{y}/{x}.png`;
};

export const getBaseUrlMidnight = () => {
  const conf = useSysConfStore.getState()?.sysConf;
  if (conf?.use_offline_map_yn === 'Y') {
    return `${conf?.url_offline_map}/tiles/{z}/{x}/{y}.png`;
  }
  return `http://api.vworld.kr/req/wmts/1.0.0/${getApiKey()}/midnight/{z}/{y}/{x}.png`;
};

// VWorld API Key
export const getApiKey = () => {
  const conf = useSysConfStore.getState()?.sysConf;
  return conf?.api_key_map || '';
  // if (conf.use_offline_map_yn === 'Y') {
  //   return conf.api_key_map || '';
  // } else {
  //   return 'CFEAB327-B762-37FD-B683-FEFE8ABD4D02'; // 최초발급.
  // }

  //return 'CFEAB327-B762-37FD-B683-FEFE8ABD4D02'; // 최초발급. - 운영.
  //return 'F3432CB6-2E27-3B99-9E4C-96EA82A0CA36'; // 재발급. (고도화)
  //return '59A4DC3E-3FFA-379F-AB7C-F6109DDA5105';
};

// 지도에 도형 그리기
export function addDraw(map: MapMap | null, source: VectorSource<Feature<Geometry>> | undefined) {
  let lastFeature: Feature<Geometry>;

  const removeLastFeature = () => {
    if (lastFeature) source?.removeFeature(lastFeature);
  };

  const draw = new Draw({
    source: source,
    type: 'Polygon',
  });
  const snap = new Snap({ source: source });

  draw.on('drawstart', (_e) => {
    source?.clear();
  });

  draw.on('drawend', (_e) => {
    removeLastFeature();
    lastFeature = _e.feature;
  });

  map?.addInteraction(draw);
  map?.addInteraction(snap);

  return { draw, snap };
}

// 지도에 그린 도형 삭제
export function removeDraw(
  map: MapMap | null,
  source: VectorSource<Feature<Geometry>> | undefined,
  draw: Draw | undefined,
  snap: Snap | undefined
) {
  if (draw) map?.removeInteraction(draw);
  if (snap) map?.removeInteraction(snap);
  source?.clear();
}

// 주소 복사
// export function copyAddress(text: string) {
//   navigator.clipboard.writeText(text); // 복사하기
//   toast.success('주소를 복사하였습니다.');
// }

// 맵 이동 함수
export function moveMap(map, pos, zoom?) {
  const view = map.getView();

  view.animate({
    center: new Point(pos).transform('EPSG:4326', 'EPSG:3857').getCoordinates(),
    zoom: zoom ? zoom : 18,
    duration: 300,
  });
}

// 맵 이동 및 마커, 주소 표시
export function addPlace(map, pos, zoom?, addr?, duration?) {
  const view = map.getView();

  view.animate({
    center: pos,
    zoom: zoom,
    duration: duration ? duration : 0,
  });

  // 마커, 주소 표시
  const marker = new Feature({
    geometry: new Point(pos),
  });
  const myStyle = new Style({
    text: new Text({
      text: addr,
      font: 'bold 14px sans-serif',
      offsetY: 50,
      offsetX: 0,
      stroke: new Stroke({
        color: '#fff',
        width: 3,
      }),
      fill: new Fill({
        color: '#6a5acd', // '#006400','#b8860b,'#6a5acd','#3f51b5','#696969','#808004','#dc143c','#635900'
      }),
      scale: 1,
      padding: [0, 0, 0, 0], // [top, right, bottom, left]
    }),
    image: new Icon({
      // anchor: [0.5, 10],
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: '/images/marker2.png',
      scale: 0.8,
    }),
  });
  marker.setStyle(myStyle);
  const markerLayer = new VectorLayer({
    source: new VectorSource({
      features: [marker],
    }),
  });
  map.addLayer(markerLayer);

  animBounceMarker(map, marker); // 애니메이션 시작

  return markerLayer;
}

// 마커, 주소 레이어 삭제
export function removePlace(map, layer) {
  cancelAnimationFrame(animationFrameId); // 애니메이션 중지
  map.removeLayer(layer);
}

// 확대보기 클릭 시 zoomIn 처리
const zoomInCluster = (map: MapMap, extent: any) => {
  const view = map.getView();
  // Zoom to the extent of the cluster members.
  // view.fit(extent, { duration: 500, padding: [150, 250, 150, 250] });

  // 모바일 환경에서 확대 범위를 줄여 마커가 보이도록 처리
  const isMobile = window.innerWidth <= 768;
  const padding = isMobile ? [50, 50, 50, 50] : [150, 250, 150, 250];

  view.fit(extent, {
    duration: 750,
    padding: padding,
  });
};

// cluster 마커 클릭 시 툴팁 보여주기
const getInnerHtml = (popText: string): string => {
  return `
    <div id="popup" class="ol-popup-multi">
      <div id="popup-content" class="popup-content">${popText}</div>
      <div class="popup-bottom">
        <button class="btn-zoom" id="btn-zoom">🔍<span class="label">확대보기</span></button>
        <button id="popup-closer" class='btn-close'><span class="label">닫기</span></button>
      </div>
    </div>
  `;
};

const getPopText = (items: any[], types: string[]) => {
  let popText: string = '<div style="height:10px"></div>';

  items?.forEach((item, idx) => {
    if (types[idx] === 'camera') {
      popText += `<div id="cluster-camera-${idx}" class='cluster-item cam ${item.cam_stat}'><img src='/images/camera_icon_tran.png' alt='카메라' />&nbsp;${item.cam_nm} (${item?.cam_ip}:${item?.cam_port})</div><div class='b-padding-5'></div>`;
    } else if (types[idx] === 'gate') {
      popText += `<div id="cluster-gate-${idx}" class='cluster-item gate ${
        item.gate_stat
      }'><img src='/images/gate_icon_tran.png' alt='차단장비' />&nbsp;${
        item.gate_nm
      } (${gateutils.gateStatTxt(item.gate_stat)})</div><div class='b-padding-5'></div>`;
    } else if (types[idx] === 'water') {
      popText += `<div id="cluster-water-${idx}" 
      class='cluster-item water ${item.water_stat} ${item.comm_stat}'>
      <img src='/images/water_icon_tran.png' alt='수위계' />&nbsp;${item.water_nm}
       (${waterutils.waterLevelText(item.water_stat)})</div><div class='b-padding-5'></div>`;
    } else if (types[idx] === 'ebrd') {
      popText += `<div id="cluster-ebrd-${idx}" class='cluster-item ebrd ${
        item.comm_stat
      }'><img src='/images/ebrd_icon_tran.png' alt='EBRD' />&nbsp;${
        item.ebrd_nm
      } (${ebrdutils.ebrdStatTxt(item.comm_stat)})</div><div class='b-padding-5'></div>`;
    } else if (types[idx] === 'emcall') {
      popText += `<div id="cluster-emcall-${idx}" class='cluster-item emcall ${
        item.comm_stat
      }'><img src='/images/emcall_icon_tran.png' alt='EMCALL' />&nbsp;${
        item.emcall_nm
      } (${emcallutils.emcallStatTxt(item.comm_stat)})</div><div class='b-padding-5'></div>`;
    } else if (types[idx] === 'emcallgrp') {
      popText += `<div id="cluster-emcallgrp-${idx}" class='cluster-item emcall ${
        item.comm_stat
      }'><img src='/images/emcall_icon_tran.png' alt='EMCALLGRP' />&nbsp;${
        item.emcall_grp_nm
      } (${emcallutils.emcallStatTxt(item.comm_stat)})</div><div class='b-padding-5'></div>`;
    }
  });
  popText += `<br/>`;
  return popText;
};

const gClusterPopup: {
  contents: HTMLDivElement | null;
  items: any[];
  types: any[];
  refDrawer?: any[];
  map: MapMap | null;
  popOverlay: Overlay | null;
  extent: any;
} = {
  contents: null,
  items: [],
  types: [],
  refDrawer: [],
  map: null,
  popOverlay: null,
  extent: null,
};

const addClusterEvent = (
  map: MapMap,
  popOverlay: Overlay,
  extent: any,
  contents: HTMLDivElement | null,
  items: any[],
  types: string[],
  refDrawer?: any[]
) => {
  // tooltip close
  const closer = document.getElementById('popup-closer');
  closer?.addEventListener('click', (e) => {
    e.preventDefault();
    contents?.remove();
    map.removeOverlay(popOverlay);
  });

  // 확대보기 클릭 시
  const zoomIn = document.getElementById('btn-zoom');
  zoomIn?.addEventListener('click', (e) => {
    e.preventDefault();
    zoomInCluster(map, extent);
    closer?.click();
  });
  // 각 클러스터 리스트 항목을 클릭 시 drawer 열리게 처리
  items?.forEach((item, idx) => {
    if (types[idx] === 'camera') {
      const openDrawer = document.getElementById(`cluster-camera-${idx}`);
      openDrawer?.addEventListener('click', (e) => {
        e.preventDefault();
        if (refDrawer) refDrawer[idx]?.current?.open(item);
      });
    } else if (types[idx] === 'gate') {
      const openDrawer = document.getElementById(`cluster-gate-${idx}`);
      openDrawer?.addEventListener('click', (e) => {
        e.preventDefault();
        if (refDrawer) refDrawer[idx]?.current?.open(item);
      });
    } else if (types[idx] === 'water') {
      const openDrawer = document.getElementById(`cluster-water-${idx}`);
      openDrawer?.addEventListener('click', (e) => {
        e.preventDefault();
        if (refDrawer) refDrawer[idx]?.current?.open(item);
      });
    } else if (types[idx] === 'ebrd') {
      const openDrawer = document.getElementById(`cluster-ebrd-${idx}`);
      openDrawer?.addEventListener('click', (e) => {
        e.preventDefault();
        if (refDrawer) refDrawer[idx]?.current?.open(item);
      });
    } else if (types[idx] === 'emcall') {
      const openDrawer = document.getElementById(`cluster-emcall-${idx}`);
      openDrawer?.addEventListener('click', (e) => {
        e.preventDefault();
        if (refDrawer) refDrawer[idx]?.current?.open(item);
      });
    } else if (types[idx] === 'emcallgrp') {
      const openDrawer = document.getElementById(`cluster-emcallgrp-${idx}`);
      openDrawer?.addEventListener('click', (e) => {
        e.preventDefault();
        if (refDrawer) refDrawer[idx]?.current?.open(item);
      });
    }
  });
};

export const clearClusterPopup = () => {
  gClusterPopup.contents = null;
};
export const updateClusterPopup = (
  cameras: Map<number, IfTbCamera> | undefined,
  gates: Map<number, IfTbGate> | undefined,
  waters: Map<number, IfTbWater> | undefined,
  ebrds: Map<number, IfTbEbrd> | undefined,
  emcalls: Map<number, IfTbEmcall> | undefined,
  emcallgrps: Map<number, IfTbEmcallGrp> | undefined
) => {
  if (!gClusterPopup.contents) return;

  const items: (IfTbCamera | IfTbGate | IfTbWater | IfTbEbrd | IfTbEmcall | IfTbEmcallGrp)[] = [];
  gClusterPopup.types.forEach((type, idx) => {
    if (type === 'camera') {
      const o: IfTbCamera = gClusterPopup.items[idx];
      if (cameras && cameras.has(o.cam_seq!)) {
        items.push(cameras.get(o.cam_seq!)!);
      } else {
        items.push(o);
      }
    } else if (type === 'gate') {
      const o: IfTbGate = gClusterPopup.items[idx];
      if (gates && gates.has(o.gate_seq!)) {
        items.push(gates.get(o.gate_seq!)!);
      } else {
        items.push(o);
      }
    } else if (type === 'water') {
      const o: IfTbWater = gClusterPopup.items[idx];
      if (waters && waters.has(o.water_seq!)) {
        items.push(waters.get(o.water_seq!)!);
      } else {
        items.push(o);
      }
    } else if (type === 'ebrd') {
      const o: IfTbEbrd = gClusterPopup.items[idx];
      if (ebrds && ebrds.has(o.ebrd_seq!)) {
        items.push(ebrds.get(o.ebrd_seq!)!);
      } else {
        items.push(o);
      }
    } else if (type === 'emcall') {
      const o: IfTbEmcall = gClusterPopup.items[idx];
      if (emcalls && emcalls.has(o.emcall_seq!)) {
        items.push(emcalls.get(o.emcall_seq!)!);
      } else {
        items.push(o);
      }
    } else if (type === 'emcallgrp') {
      const o: IfTbEmcallGrp = gClusterPopup.items[idx];
      if (emcallgrps && emcallgrps.has(o.emcall_grp_seq!)) {
        items.push(emcallgrps.get(o.emcall_grp_seq!)!);
      } else {
        items.push(o);
      }
    } else {
      items.push(gClusterPopup.items[idx]);
    }
  });
  const popText = getPopText(items, gClusterPopup.types);
  gClusterPopup.contents.innerHTML = getInnerHtml(popText);

  // 새롭게 innerHTML을 설정했기 때문에 클릭 이벤트 새로 연결.
  const { types, refDrawer, contents, extent, map, popOverlay } = gClusterPopup;
  addClusterEvent(map!, popOverlay!, extent, contents, items, types, refDrawer);
};

export function viewTooltipClusterItems(
  map: MapMap,
  extent: any,
  pos: Coordinate,
  types: string[],
  items: any[],
  refDrawer?: any[]
) {
  const isOpened = document.getElementById('popup-closer');
  if (isOpened) return; // tooltip이 중복되어 열리는 현상 방지

  const popText = getPopText(items, types);

  const contents = document.createElement('div');
  gClusterPopup.contents = contents;
  gClusterPopup.types = types;
  gClusterPopup.items = items;
  gClusterPopup.refDrawer = refDrawer;

  contents.style.display = 'relative';
  if (popText !== '') {
    contents.innerHTML = getInnerHtml(popText);
  }

  const popOverlay = new Overlay({
    position: fromLonLat(pos),
    element: contents,
    positioning: 'bottom-left',
    // stopEvent: false,
    offset: [0, -30],
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });
  map.addOverlay(popOverlay);

  gClusterPopup.map = map;
  gClusterPopup.popOverlay = popOverlay;
  gClusterPopup.extent = extent;

  addClusterEvent(map, popOverlay, extent, contents, items, types, refDrawer);
}

// 마커 클릭 시 툴팁 보여주기
export function viewTooltipSingleItem(
  map: MapMap,
  pos: Coordinate,
  type: string,
  item: any,
  refDrawer?: any,
  refCameraView?: any
) {
  let popText: string = '';
  if (type === 'camera') {
    popText = `<button class="btn-camera" id="btn-camera"><span class="icon-container">📷</span><p class="text">영상보기</p></button><br/>${item.cam_nm}<br/>IP: ${item?.cam_ip}:${item?.cam_port}<br/>위경도: ${item.cam_lat}, ${item.cam_lng}`;
  } else if (type === 'gate') {
    popText = `<button class="btn-camera" id="btn-camera"><span class="icon-container">📷</span><p class="text">영상보기</p></button>
      <br/>${item.gate_nm}<br/>상태: ${gateutils.gateStatTxt(item.gate_stat)}<br/>IP: ${
      item.gate_ip
    }:${item.gate_port}<br/>위경도: ${item.gate_lat}, ${item.gate_lng}`;
  } else if (type === 'water') {
    popText = `${item.water_nm}<br>상태: ${waterutils.waterLevelText(item.water_stat)}<br>관심: ${
      item.limit_attn
    }, 주의: ${item.limit_warn}<br/>경계: ${item.limit_alert}, 심각: ${
      item.limit_crit
    }<br/>위경도: ${item.water_lat}, ${item.water_lng}`;
  } else if (type === 'ebrd') {
    popText = `${item.ebrd_nm}<br>상태: ${ebrdutils.ebrdStatTxt(item.comm_stat)}<br>위경도: ${
      item.ebrd_lat
    }, ${item.ebrd_lng}`;
  } else if (type === 'emcall') {
    popText = `${item.emcall_nm}<br>상태: ${emcallutils.emcallStatTxt(item.comm_stat)}<br>위경도: ${
      item.emcall_lat
    }, ${item.emcall_lng}`;
  } else if (type === 'emcallgrp') {
    popText = `${item.emcall_grp_nm}<br>상태: ${emcallutils.emcallStatTxt(
      item.comm_stat
    )}<br>위경도: ${item.emcall_grp_lat}, ${item.emcall_grp_lng}`;
  }

  const contents = document.createElement('div');
  if (popText !== '') {
    contents.innerHTML = `
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content">${popText}</div>
    </div>
  `;
  }

  const popOverlay = new Overlay({
    position: fromLonLat(pos),
    element: contents,
    positioning: 'bottom-center',
    // stopEvent: false,
    offset: [0, -30],
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });
  map.addOverlay(popOverlay);

  // drawer open
  refDrawer.current?.open(item);

  // tooltip close
  const closer = document.getElementById('popup-closer');
  closer?.addEventListener('click', (e) => {
    e.preventDefault();
    contents.remove();
    map.removeOverlay(popOverlay);
  });

  // 영상보기 클릭 시
  const popup = document.getElementById('btn-camera');
  popup?.addEventListener('click', (e) => {
    e.preventDefault();
    if (type === 'camera') {
      refCameraView?.current.show(item);
    } else if (type === 'gate') {
      const data = fetchCameraData(`/api/camera/one?camSeq=${item.cam_seq}`);
      data.then((res) => {
        refCameraView?.current.show(res);
      });
    }
  });
}

// 마커 설정
export function setClusterItem(type: string, item: any) {
  let svgIcon: string = '/images/camera_icon.png';
  let lngNum: number = 0;
  let latNum: number = 0;

  if (type === 'camera') {
    svgIcon = camerautils.statIcon(item?.cam_stat);
    lngNum = item.cam_lng;
    latNum = item.cam_lat;
  } else if (type === 'gate') {
    svgIcon = gateutils.gateStatIcon(item?.gate_stat);
    lngNum = item.gate_lng;
    latNum = item.gate_lat;
  } else if (type === 'water') {
    svgIcon = waterutils.getWaterIcon(item);
    lngNum = item.water_lng;
    latNum = item.water_lat;
  } else if (type === 'ebrd') {
    svgIcon = ebrdutils.getEbrdIcon(item);
    lngNum = item.ebrd_lng;
    latNum = item.ebrd_lat;
  } else if (type === 'emcall') {
    svgIcon = emcallutils.getEmcallIcon(item);
    lngNum = item.emcall_lng;
    latNum = item.emcall_lat;
  } else if (type === 'emcallgrp') {
    svgIcon = emcallutils.getEmcallIcon(item);
    lngNum = item.emcall_grp_lng;
    latNum = item.emcall_grp_lat;
  }

  const marker = new Feature({
    geometry: new Point(fromLonLat([lngNum || gconf.defLng, latNum || gconf.defLat])),
  });

  const myStyle = new Style({
    text: new Text({
      text:
        type === 'camera'
          ? item.cam_nm
          : type === 'gate'
          ? item.gate_nm
          : type === 'ebrd'
          ? item.ebrd_nm
          : type === 'emcall'
          ? item.emcall_nm
          : type === 'emcallgrp'
          ? item.emcall_grp_nm
          : `${item.water_nm} (${waterutils.getWaterStat(item)})`,
      font: 'bold 14px sans-serif',
      offsetY: 14,
      offsetX: 0,
      stroke: new Stroke({
        color: '#fff',
        width: 3,
      }),
      fill: new Fill({
        color:
          type === 'water' &&
          (item?.comm_stat !== 'Ok' || item?.water_stat === 'Alert' || item?.water_stat === 'Crit')
            ? waterutils.getWaterStatColor(item)
            : '#635900', // '#006400','#b8860b,'#6a5acd','#3f51b5','#696969','#808004','#dc143c','#635900'
      }),
      // backgroundStroke: new Stroke({
      //   color: 'rgba(255, 255, 255, 0.44)',
      //   width: 18,
      //   lineCap: 'round',
      //   lineJoin: 'round',
      // }),
      // backgroundFill: new Fill({
      //   // color: 'transparent',
      //   color: 'rgba(255, 255, 255, 0.44)',
      // }),
      scale: 1,
      padding: [5, 5, 5, 5], // [top, right, bottom, left]
    }),
    image: new Icon({
      anchor: [0.5, 1],
      src: svgIcon,
      scale: 0.5,
    }),
  });

  marker.setStyle(myStyle);
  marker.set('item', item);
  marker.set('pos', [lngNum, latNum]);
  marker.set('type', type);

  return marker;
}
