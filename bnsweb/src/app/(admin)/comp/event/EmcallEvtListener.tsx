import { useRef } from 'react';
import { IfWsMsg, isEmcallEvt, useWsMsg } from '@/app/ws/useWsMsg';
import { IfTbEmcallEvtHist } from '@/models/emcall/tb_emcall_evt_hist';
import { useDrawerEmcall } from '@/app/(admin)/comp/drawer/emcall/DrawerEmcall';
import axios from 'axios';
import { mapStore } from '@/store/mapStore';
import { fromLonLat } from 'ol/proj';
import * as maputils from '@/utils/map-utils';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Overlay from 'ol/Overlay';

type Props = {
  refDrawer: ReturnType<typeof useDrawerEmcall>[0];
};

export default function EmcallEvtListener({ refDrawer }: Props) {
  const { map } = mapStore();
  const messageOverlayRef = useRef<Overlay | null>(null);

  const showMessage = () => {
    if (!map) return;

    // 기존 메시지 오버레이 제거
    if (messageOverlayRef.current) {
      const element = messageOverlayRef.current.getElement();
      if (element) {
        element.style.display = 'none';
      }
      map.removeOverlay(messageOverlayRef.current);
    }

    // 메시지 박스
    const msgBox = document.createElement('div');
    msgBox.className = 'emcall-message';
    msgBox.style.display = 'flex';
    msgBox.style.alignItems = 'center';
    msgBox.style.gap = '10px';
    msgBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    msgBox.style.padding = '8px 16px';
    msgBox.style.borderRadius = '4px';
    msgBox.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    // 메시지 텍스트
    const msgText = document.createElement('span');
    msgText.innerHTML = '🔕 비상벨이 눌렸습니다.';
    msgText.style.color = '#E74032';
    msgText.style.fontWeight = 'bold';
    msgText.style.fontSize = '24px';
    msgText.style.whiteSpace = 'nowrap';

    // 닫기 버튼
    const btnClose = document.createElement('button');
    btnClose.innerHTML = '×';
    btnClose.style.color = '#999';
    btnClose.style.fontSize = '34px';
    btnClose.style.cursor = 'pointer';
    btnClose.style.padding = '4px 8px';
    btnClose.style.borderRadius = '50%';
    btnClose.style.width = '42px';
    btnClose.style.height = '42px';
    btnClose.style.display = 'flex';
    btnClose.style.alignItems = 'center';
    btnClose.style.justifyContent = 'center';
    btnClose.style.transition = 'all 0.2s ease';
    btnClose.style.marginLeft = '10px';
    btnClose.onmouseover = () => {
      btnClose.style.backgroundColor = '#f5f5f5';
      btnClose.style.color = '#E74032';
      btnClose.style.transform = 'rotate(90deg)';
    };
    btnClose.onmouseout = () => {
      btnClose.style.backgroundColor = 'transparent';
      btnClose.style.color = '#999';
      btnClose.style.transform = 'rotate(0deg)';
    };
    btnClose.onclick = () => {
      stopAlarm();
    };

    msgBox.appendChild(msgText);
    msgBox.appendChild(btnClose);

    const mapSize = map.getSize();
    const center = map.getView().getCenter();
    if (!center || !mapSize) return;

    const overlay = new Overlay({
      element: msgBox,
      position: center,
      positioning: 'bottom-center',
      offset: [0, -100], // 마커 위로 100픽셀 이동
    });

    map.addOverlay(overlay);
    messageOverlayRef.current = overlay;
  };

  const startAlarm = (data: IfTbEmcallEvtHist) => {
    axios.get(`/api/emcall/one_by_id?emcallId=${data?.emcall_id}`).then((res) => {
      refDrawer.current?.open(res.data);

      if (map && res.data.emcall_lat && res.data.emcall_lng) {
        const coordinate = fromLonLat([res.data.emcall_lng, res.data.emcall_lat]);
        map.getView().setCenter(coordinate);
        map.getView().setZoom(18);

        // 메시지 표시
        showMessage();

        const marker = maputils.setClusterItem('emcall', res.data);
        if (marker) {
          let markerLayer = map
            .getLayers()
            .getArray()
            .find((layer) => layer.get('name') === 'emcallMarker');

          if (!markerLayer) {
            const source = new VectorSource();
            markerLayer = new VectorLayer({
              source: source,
            });
            markerLayer.set('name', 'emcallMarker');
            map.addLayer(markerLayer);
          }

          (markerLayer as VectorLayer<VectorSource>).getSource()?.clear();
          (markerLayer as VectorLayer<VectorSource>).getSource()?.addFeature(marker);
          maputils.animPulseMarker(map, marker);
        }
      }
    });
  };

  const stopAlarm = () => {
    if (!map) return;

    // 펄스 애니메이션 중지
    maputils.stopPulseAnimation(map);

    // 메시지 오버레이 제거
    if (messageOverlayRef.current) {
      map.removeOverlay(messageOverlayRef.current);
      messageOverlayRef.current = null;
    }
  };

  useWsMsg((msg) => {
    if (isEmcallEvt(msg)) {
      const data = (msg as IfWsMsg<IfTbEmcallEvtHist>).data;
      console.log('Received event:', data.emcall_evt_type);

      if (data?.emcall_evt_type === 'B_PUSH') {
        // 비상벨 버튼 눌렀을 때
        startAlarm(data);
      }
      if (data?.emcall_evt_type === 'B_STOP') {
        // 비상통화 중지
        stopAlarm();
      }
    }
  });

  return null;
}
