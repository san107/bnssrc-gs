// @flow
import { IfTbConfig } from '@/models/tb_config';
import { mapStore } from '@/store/mapStore';
import { useConfigStore } from '@/store/useConfigStore';
import { latlngfixed, zoomfixed } from '@/utils/num-utils';
import axios from 'axios';
import { toLonLat } from 'ol/proj';
import { toast } from 'sonner';

type Props = {
  setShow: (v: boolean) => void;
  top: number;
  left: number;
};

export const useHandleSetHome = ({ top, left, setShow }: Props) => {
  const { config, setConfig } = useConfigStore();
  const { map } = mapStore();
  const handleSetHome = () => {
    if (!map) {
      console.error('map is null');
      toast.error('지도가 설정되어 있지 않습니다');
      setShow(false);
      return;
    }
    const coord = map.getCoordinateFromPixel([left, top] /*[x, y]*/);
    const lonlat = toLonLat(coord);
    const lng = latlngfixed(lonlat[0]);
    const lat = latlngfixed(lonlat[1]);
    const zoom = zoomfixed(map.getView().getZoom()!);
    const conf: IfTbConfig = { ...config, def_lat: lat, def_lng: lng, def_zoom: zoom };
    axios
      .post('/api/config/save', conf)
      .then((res) => {
        setConfig(res.data);
        toast.success('홈으로 저장하였습니다');
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
    setShow(false);
  };
  return handleSetHome;
};
