'use client';

import { useDrawerCamera, useDrawerCameraStore } from '@/app/(admin)/comp/drawer/DrawerCamera';
import { useDrawerGate, useDrawerGateStore } from '@/app/(admin)/comp/drawer/DrawerGate';
import { useDrawerWater, useDrawerWaterStore } from '@/app/(admin)/comp/drawer/DrawerWater';
import { useDrawerEbrd, useDrawerEbrdStore } from '@/app/(admin)/comp/drawer/ebrd/DrawerEbrd';
import {
  useDrawerEmcall,
  useDrawerEmcallStore,
} from '@/app/(admin)/comp/drawer/emcall/DrawerEmcall';
import {
  useDrawerEmcallGrp,
  useDrawerEmcallGrpStore,
} from '@/app/(admin)/comp/drawer/emcallgrp/DrawerEmcallGrp';
import EmcallEvtListener from '@/app/(admin)/comp/event/EmcallEvtListener';
import { LabelLatLng } from '@/app/(admin)/comp/map/LabelLatLng';
import { MapCtxMenu } from '@/app/(admin)/comp/map/mapmenu/MapCtxMenu';
import MapToolbar from '@/app/(admin)/comp/map/MapToolbar';
import SearchLocation from '@/app/(admin)/comp/map/SearchLocation';
import { useMapClickStore } from '@/app/(admin)/comp/map/useMapClickStore';
import { broadcastMapOlClick } from '@/app/(admin)/comp/map/useMapOlClick';
import { useDlgCameraView } from '@/app/(admin)/comp/popup/DlgCameraView';
import { useTopMenuStore } from '@/app/(admin)/topmenu/useTopMenuInfoStore';
import { useMobile } from '@/hooks/useMobile';
import { useRefCtx } from '@/hooks/useRefCtx';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import { IfTbEmcallGrp } from '@/models/emcall/tb_emcall_grp';
import { IfTbGate } from '@/models/gate/tb_gate';
import { IfTbCamera } from '@/models/tb_camera';
import { IfTbWater } from '@/models/water/tb_water';
import { mapStore } from '@/store/mapStore';
import { useConfigStore } from '@/store/useConfigStore';
import { gconf } from '@/utils/gconf';
import * as maputils from '@/utils/map-utils';
import { latlngfixed, zoomfixed } from '@/utils/num-utils';
import { Box } from '@mui/material';
import { Map as MapMap, View as MapView } from 'ol';
import { defaults } from 'ol/control';
import { createEmpty, extend } from 'ol/extent.js';
import Feature from 'ol/Feature.js';
import Geometry from 'ol/geom/Geometry.js';
import { Tile } from 'ol/layer';
import { Vector as VectorLayer } from 'ol/layer.js';
import 'ol/ol.css';
import { fromLonLat, toLonLat, transform } from 'ol/proj';
import { OSM, XYZ } from 'ol/source';
import { Cluster, Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
import { useEffect, useRef, useState } from 'react';

/**
 *
 * 우선순위는, err이 하나라도 있으면, err
 * na 가 하나라도 있으면 na,
 * 그외는 정상.
 */

//export type WaterStat = 'Unknown' | 'Norm' | 'Attn' | 'Warn' | 'Alert' | 'Crit';
// gate_stat?: '' | 'UpOk' | 'UpLock' | 'DownOk' | 'Stop' | 'Na';
const levelInfo = {
  Norm: 1,
  Ok: 1, // 카메라 정상.
  UpOk: 1,
  UpLock: 1,
  DownOk: 6,
  Na: 2, // 회
  Unknown: 2, // 회
  Attn: 3, // 파랑.
  Warn: 4, // 노랑
  Alert: 5, // 오렌지
  Crit: 6, // 적,
  Err: 6, // 카메라 에러.
};

function getClusterStat(features): number {
  let stat = 0;
  for (let i = 0; i < features.length; i++) {
    const o: Feature = features[i];
    const type = o.get('type');
    if (type === 'gate') {
      const dev: IfTbGate = o.get('item');
      if (!dev.gate_stat) continue;
      const l = levelInfo[dev.gate_stat];
      if (!l) continue;
      if (l > stat) stat = l;
    } else if (type === 'camera') {
      const dev: IfTbCamera = o.get('item');
      if (!dev.cam_stat) continue;
      const l = levelInfo[dev.cam_stat];
      if (!l) continue;
      if (l > stat) stat = l;
    } else if (type === 'water') {
      const dev: IfTbWater = o.get('item');
      if (dev.comm_stat === 'Err') {
        const l = levelInfo[dev.comm_stat];
        if (!l) continue;
        if (l > stat) stat = l;
        continue;
      }
      if (!dev.water_stat) continue;
      const l = levelInfo[dev.water_stat];
      if (!l) continue;
      if (l > stat) stat = l;
    } else if (type === 'ebrd') {
      const dev: IfTbEbrd = o.get('item');
      // if (!dev.comm_stat) continue;
      const l = levelInfo[dev.comm_stat || 'Na'];
      if (!l) continue;
      if (l > stat) stat = l;
    } else if (type === 'emcall') {
      const dev: IfTbEmcall = o.get('item');
      // if (!dev.comm_stat) continue;
      const l = levelInfo[dev.comm_stat || 'Na'];
      if (!l) continue;
      if (l > stat) stat = l;
    } else if (type === 'emcallgrp') {
      const dev: IfTbEmcallGrp = o.get('item');
      // if (!dev.comm_stat) continue;
      const l = levelInfo[dev.comm_stat || 'Na'];
      if (!l) continue;
      if (l > stat) stat = l;
    }
  }
  return stat;
}

const getFillClusterColor = (n: number) => {
  if (n <= 0) return '#3399CC'; // 카메라만 있는 경우.
  //if (n <= 1) return '#22c55e';
  if (n <= 1) return '#429e22';
  if (n <= 2) return '#83868d';
  if (n <= 3) return '#3B82F6';
  if (n <= 4) return '#f59e0b';
  if (n <= 5) return '#f97316';
  if (n <= 6) return '#ef4444';
  return '#ef4444';
};

function clusterStyle(feature) {
  const size = feature.get('features').length;

  if (size > 1) {
    const nstat = getClusterStat(feature.get('features'));
    return new Style({
      image: new CircleStyle({
        radius: 20,
        stroke: new Stroke({ color: '#fff' }),
        fill: new Fill({ color: getFillClusterColor(nstat) }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({ color: '#fff' }),
        scale: 1.8,
      }),
    });
  }
  const originalFeature = feature.get('features')[0];
  return originalFeature.getStyle();
}

type Props = {
  devs: {
    camera?: Array<IfTbCamera> | null;
    gate?: Array<IfTbGate> | null;
    water?: Array<IfTbWater> | null;
    ebrd?: Array<IfTbEbrd> | null;
    emcall?: Array<IfTbEmcall> | null;
    emcallgrp?: Array<IfTbEmcallGrp> | null;
  } | null;
};

export function MapOl({ devs }: Props) {
  const { config } = useConfigStore();
  const { map, setMap } = mapStore();
  const refMap = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState<VectorSource<Feature<Geometry>>>();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ top: 0, left: 0 });
  const { isMobile } = useMobile();

  const [refDrawerCamera, DrawerCamera] = useDrawerCamera();
  const [refDrawerGate, DrawerGate] = useDrawerGate();
  const [refDrawerWater, DrawerWater] = useDrawerWater();
  const [refDrawerEbrd, DrawerEbrd] = useDrawerEbrd();
  const [refDrawerEmcall, DrawerEmcall] = useDrawerEmcall();
  const [refDrawerEmcallGrp, DrawerEmcallGrp] = useDrawerEmcallGrp();
  const [refCameraView, DlgCameraView] = useDlgCameraView();

  const { setRef: setCamera } = useDrawerCameraStore();
  const { setRef: setGate } = useDrawerGateStore();
  const { setRef: setWater } = useDrawerWaterStore();
  const { setRef: setEbrd } = useDrawerEbrdStore();
  const { setRef: setEmcall } = useDrawerEmcallStore();
  const { setRef: setEmcallGrp } = useDrawerEmcallGrpStore();

  const ctx = useRefCtx({
    openContextMenu: (e) => {
      setContextMenuPos({ left: e.layerX, top: e.layerY });
      setShowContextMenu(true);
    },
    closeContextMenu: () => {
      if (showContextMenu) setShowContextMenu(false);
    },
  });

  useEffect(() => {
    setCamera(refDrawerCamera);
    return () => setCamera(null);
  }, [refDrawerCamera, setCamera]);

  useEffect(() => {
    setGate(refDrawerGate);
    return () => setGate(null);
  }, [refDrawerGate, setGate]);

  useEffect(() => {
    setWater(refDrawerWater);
    return () => setWater(null);
  }, [refDrawerWater, setWater]);

  useEffect(() => {
    setEbrd(refDrawerEbrd);
    return () => setEbrd(null);
  }, [refDrawerEbrd, setEbrd]);

  useEffect(() => {
    setEmcall(refDrawerEmcall);
    return () => setEmcall(null);
  }, [refDrawerEmcall, setEmcall]);

  useEffect(() => {
    setEmcallGrp(refDrawerEmcallGrp);
    return () => setEmcallGrp(null);
  }, [refDrawerEmcallGrp, setEmcallGrp]);

  const { topMenuInfo } = useTopMenuStore();

  useEffect(() => {
    if (map === null) return;
    const features: Array<Feature> = [];

    const cameras = new Map<number, IfTbCamera>();
    const gates = new Map<number, IfTbGate>();
    const waters = new Map<number, IfTbWater>();
    const ebrds = new Map<number, IfTbEbrd>();
    const emcalls = new Map<number, IfTbEmcall>();
    const emcallgrps = new Map<number, IfTbEmcallGrp>();
    if (topMenuInfo.camera) {
      devs?.camera?.map((item: IfTbCamera) => {
        features.push(maputils.setClusterItem('camera', item));
        cameras.set(item.cam_seq!, item);
      });
    }
    if (topMenuInfo.gate) {
      devs?.gate?.map((item: IfTbGate) => {
        features.push(maputils.setClusterItem('gate', item));
        gates.set(item.gate_seq!, item);
      });
    }
    if (topMenuInfo.water) {
      devs?.water?.map((item: IfTbWater) => {
        features.push(maputils.setClusterItem('water', item));
        waters.set(item.water_seq!, item);
      });
    }
    if (topMenuInfo.ebrd) {
      devs?.ebrd?.map((item: IfTbEbrd) => {
        features.push(maputils.setClusterItem('ebrd', item));
        ebrds.set(item.ebrd_seq!, item);
      });
    }
    if (topMenuInfo.emcall) {
      devs?.emcall?.map((item: IfTbEmcall) => {
        features.push(maputils.setClusterItem('emcall', item));
        emcalls.set(item.emcall_seq!, item);
      });
    }
    if (topMenuInfo.emcallgrp) {
      devs?.emcallgrp?.map((item: IfTbEmcallGrp) => {
        features.push(maputils.setClusterItem('emcallgrp', item));
        emcallgrps.set(item.emcall_grp_seq!, item);
      });
    }
    map.getLayers().forEach((layer) => {
      if (!(layer instanceof VectorLayer)) return;
      const cluster: Cluster<any> = layer.getSource();
      const source = new VectorSource({
        features: features,
      });
      cluster?.setSource?.(source);

      // 모바일 환경에서 처음 로드시 클러스트가 보이도록 처리
      if (isMobile && features.length > 0) {
        const extent = createEmpty();
        features.forEach((feature) => {
          const geometry = feature.getGeometry();
          if (geometry) extend(extent, geometry.getExtent());
        });
        map.getView().fit(extent, {
          padding: [100, 100, 100, 100],
          maxZoom: 18,
        });
      }
    });
    // 팝업 갱신.
    maputils.updateClusterPopup(cameras, gates, waters, ebrds, emcalls, emcallgrps);
  }, [
    devs?.camera,
    devs?.gate,
    devs?.water,
    devs?.ebrd,
    devs?.emcall,
    devs?.emcallgrp,
    map,
    topMenuInfo,
    isMobile,
  ]);

  useEffect(() => {
    //if (!config.def_lat || !config.def_lng) return;

    const features: Array<Feature> = [];

    const source = new VectorSource({
      features: features,
    });

    const clusterSource = new Cluster({
      distance: 60,
      // minDistance: 10,
      source: source,
    });

    const clusters = new VectorLayer({
      source: clusterSource,
      style: clusterStyle,
    });

    // 구역 그리기용 레이어
    const vector = new VectorLayer({
      source: source,
      style: {
        // 'fill-color': 'rgb(255, 255, 255, 0.5)',
        'fill-color': 'rgb(255, 111, 0, 0.3)',
        'stroke-color': 'rgb(255, 111, 0)',
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': '#ffcc33',
      },
    });

    const vworldmap = true;
    // create Map instance
    const map = new MapMap({
      controls: defaults({ zoom: true, rotate: false }).extend([]),
      layers: [
        vworldmap
          ? new Tile({
              visible: true,
              preload: Infinity,
              source: new XYZ({
                url: maputils.getBaseUrl(),
                //url: `http://bisangsoft.iptime.org:9999/tiles/{z}/{x}/{y}.png`,
                //url: `http://127.0.0.1:3013/tiles/{z}/{x}/{y}.png`,
              }),
            })
          : new Tile({
              source: new OSM(),
            }),
        clusters,
        vector,
      ],
      target: refMap.current === null ? undefined : refMap.current,
      view: new MapView({
        center: fromLonLat([config.def_lng || gconf.defLng, config.def_lat || gconf.defLat]),
        zoom: config.def_zoom || 15,
        maxZoom: 20,
      }),
    });

    // set source
    setSource(source);

    map.on('movestart', (_event) => {
      //map.getOverlays().clear();
      ctx.current?.closeContextMenu();
    });
    map.getViewport().addEventListener('contextmenu', (e) => {
      e.preventDefault();

      ctx.current?.openContextMenu(e);
    });

    map.on('click', (event) => {
      const currentPos = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      // console.log('currentPos', currentPos);
      (() => {
        const coordinate = toLonLat(event.coordinate);
        const lng = latlngfixed(coordinate[0]);
        const lat = latlngfixed(coordinate[1]);
        const zoom = zoomfixed(event.map.getView().getZoom()!);
        useMapClickStore.setState({ clickInfo: { lat, lng, zoom } });
      })();

      clusters.getFeatures(event.pixel).then((features) => {
        if (features.length > 0) {
          // 우선제거하고
          map.getOverlays().clear();
          maputils.clearClusterPopup();
          ctx.current?.closeContextMenu();

          const clusterItems = features[0].get('features');

          if (clusterItems.length > 1) {
            // Calculate the extent of the cluster members.
            const extent = createEmpty();
            const tooltipItemsType: string[] = [];
            const tooltipItems: any[] = [];
            const refDrawers: any[] = [];

            clusterItems.forEach((feature: Feature) => {
              const geometry = feature.getGeometry();
              if (geometry) extend(extent, geometry.getExtent());

              tooltipItemsType.push(feature.get('type'));
              tooltipItems.push(feature.get('item'));

              if (feature.get('type') === 'camera') refDrawers.push(refDrawerCamera);
              else if (feature.get('type') === 'gate') refDrawers.push(refDrawerGate);
              else if (feature.get('type') === 'water') refDrawers.push(refDrawerWater);
              else if (feature.get('type') === 'ebrd') refDrawers.push(refDrawerEbrd);
              else if (feature.get('type') === 'emcall') refDrawers.push(refDrawerEmcall);
              else if (feature.get('type') === 'emcallgrp') refDrawers.push(refDrawerEmcallGrp);
            });
            maputils.viewTooltipClusterItems(
              map,
              extent,
              currentPos,
              tooltipItemsType,
              tooltipItems,
              refDrawers
            );
          }

          // marker click 시 tooptip 띄움
          if (clusterItems.length === 1) {
            let refDrawer: any;
            const type = clusterItems[0].get('type');
            if (type === 'camera') refDrawer = refDrawerCamera;
            else if (type === 'gate') refDrawer = refDrawerGate;
            else if (type === 'water') refDrawer = refDrawerWater;
            else if (type === 'ebrd') refDrawer = refDrawerEbrd;
            else if (type === 'emcall') refDrawer = refDrawerEmcall;
            else if (type === 'emcallgrp') refDrawer = refDrawerEmcallGrp;

            // drawer 에서 모든 정보를 표출하고 툴팁은 제거
            refDrawer.current?.open(clusterItems && clusterItems[0].get('item'));
          }
        } else {
          // 아무것도 없는 곳 클릭시 모든 tooltip 제거
          map.getOverlays().clear();
          maputils.clearClusterPopup();
          ctx.current?.closeContextMenu();
        }
      });

      broadcastMapOlClick(event);
    });
    // setMarker(map);
    setMap(map);
    return () => {
      map.dispose();
      setMap(null);
    };
  }, [
    setMap,
    config.def_lat,
    config.def_lng,
    config.def_zoom,
    refCameraView,
    refDrawerCamera,
    refDrawerGate,
    refDrawerWater,
    refDrawerEbrd,
    refDrawerEmcall,
    refDrawerEmcallGrp,
    ctx,
  ]);

  return (
    <Box ref={refMap} sx={{ flexGrow: 1, position: 'relative', ovflowX: 'hidden' }}>
      <MapCtxMenu
        show={showContextMenu}
        setShow={setShowContextMenu}
        top={contextMenuPos.top}
        left={contextMenuPos.left}
      />
      <MapToolbar map={map || null} source={source || undefined} />
      <Box sx={{ display: { xs: 'block', sm: 'block' } }}>
        <SearchLocation />
      </Box>
      <DrawerCamera />
      <DrawerGate />
      <DrawerWater />
      <DrawerEbrd />
      <DrawerEmcall />
      <DrawerEmcallGrp />
      <EmcallEvtListener refDrawer={refDrawerEmcall} />
      <DlgCameraView />
      <LabelLatLng />
    </Box>
  );
}
