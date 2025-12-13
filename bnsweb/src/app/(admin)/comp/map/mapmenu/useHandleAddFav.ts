// @flow
import { IfTbBookMark } from '@/models/tb_book_mark';
import { mapStore } from '@/store/mapStore';
import { latlngfixed, zoomfixed } from '@/utils/num-utils';
import axios from 'axios';
import { toLonLat } from 'ol/proj';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
type Props = {
  setShow: (v: boolean) => void;
  top: number;
  left: number;
};
export const useHandleAddFav = ({ top, left, setShow }: Props) => {
  const { map } = mapStore();
  const { mutate } = useSWRConfig();
  const handleAddFav = (bm_nm: string) => {
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
    const param: IfTbBookMark = { bm_lat: lat, bm_lng: lng, bm_zoom: zoom, bm_nm };
    axios
      .post('/api/book_mark/save', param)
      .then((res) => {
        console.log('res is ', res.data);
        toast.success('즐겨찾기를 저장하였습니다');
        // list mutate.
        mutate((key) => {
          if (Array.isArray(key)) {
            console.log('key', key);
            if (key?.[0].startsWith('/api/book_mark/list')) {
              return true;
            }
          }
          return false;
        });
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
    setShow(false);
  };
  return handleAddFav;
};
