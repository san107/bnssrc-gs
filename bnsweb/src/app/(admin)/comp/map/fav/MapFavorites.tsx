import { IfTbBookMark } from '@/models/tb_book_mark';
import { mapStore } from '@/store/mapStore';
import { Home } from '@mui/icons-material';
import StarPurple500Icon from '@mui/icons-material/StarPurple500';
import { Box, IconButton, styled, SvgIcon } from '@mui/material';
import { fromLonLat } from 'ol/proj';
import { MdDeleteForever } from 'react-icons/md';
import * as maputils from '@/utils/map-utils';

// @flow
import { useConfigStore } from '@/store/useConfigStore';
import axios from 'axios';
import * as React from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
type Props = { open?: boolean };
export const MapFavorites = ({ open }: Props) => {
  const { data: list, mutate } = useSWR<IfTbBookMark[]>(['/api/book_mark/list']);
  const { map } = mapStore();
  const { config } = useConfigStore();
  const hasMarker = React.useRef<any>(null);

  React.useEffect(() => {
    if (hasMarker.current) maputils.removePlace(map, hasMarker.current);
  }, [open, map]);

  const handleItemClick = (_e, bm: IfTbBookMark) => {
    const pos = { lat: bm.bm_lat, lng: bm.bm_lng, zoom: bm.bm_zoom, nm: bm.bm_nm };
    if (!pos?.lat || !pos?.lng || !map || !pos?.zoom) return;
    const coordinate = fromLonLat([pos?.lng, pos?.lat]);
    // const view = map.getView();
    // // Zoom to the extent of the cluster members.
    // view.animate({
    //   center: coordinate,
    //   zoom: pos.zoom,
    //   duration: 2000,
    // });

    if (hasMarker.current) maputils.removePlace(map, hasMarker.current);
    hasMarker.current = maputils.addPlace(map, coordinate, pos?.zoom, pos?.nm, 2000);
  };
  const handleClickDelete = (e: React.MouseEvent, bm: IfTbBookMark) => {
    e.preventDefault();
    e.stopPropagation();
    // 삭제 처리.
    axios
      .post('/api/book_mark/delete', bm)
      .then((res) => {
        console.log('res', res.data);
        mutate();
        toast.success('삭제하였습니다');
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('삭제에 실패하였습니다');
      });
  };
  return (
    <>
      {open && (
        <div className='region-box'>
          <div className='region-list'>
            <MenuItem
              onClick={(e) =>
                handleItemClick(e, {
                  bm_lat: config.def_lat,
                  bm_lng: config.def_lng,
                  bm_zoom: config.def_zoom,
                })
              }
            >
              <Home sx={{ width: 20, height: 20, color: '#FFCA28' }} />
              &nbsp; 기본 보기
              <Box flexGrow={1} />
            </MenuItem>
            {list?.map((ele) => (
              <MenuItem key={ele.bm_seq} onClick={(e) => handleItemClick(e, ele)}>
                <StarPurple500Icon sx={{ width: 20, height: 20, color: '#FFCA28' }} />
                &nbsp;
                {ele.bm_nm}
                <Box flexGrow={1} />
                <IconButton
                  aria-label='delete'
                  size='small'
                  onClick={(e) => handleClickDelete(e, ele)}
                >
                  <SvgIcon>
                    <MdDeleteForever color='#777' />
                  </SvgIcon>
                </IconButton>
              </MenuItem>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const MenuItem = styled(Box)`
  background-color: #23272e;
  color: white;
  padding: 0px 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-height: 35px;
  border-bottom: 1px solid #43474e;
  font-size: small;
  &:hover {
    background-color: #43474e;
  }
`;
