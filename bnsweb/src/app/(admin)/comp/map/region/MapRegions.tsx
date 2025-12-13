import { IfTbRegion } from '@/models/tb_region';
import { mapStore } from '@/store/mapStore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Box, IconButton, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { createEmpty, extend } from 'ol/extent.js';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Geometry from 'ol/geom/Geometry.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import React, { useEffect, useRef, useState } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { toast } from 'sonner';
import useSWR from 'swr';

type Props = { open?: boolean };

export const MapRegions = ({ open }: Props) => {
  const { data: list, mutate } = useSWR<IfTbRegion[]>(['/api/region/list']);
  const { map } = mapStore();
  const [vSource, setVSource] = useState<VectorSource<Feature<Geometry>> | undefined>(undefined);

  useEffect(() => {
    if (!open && vSource) removeRegion(vSource);
  }, [open, vSource]);

  const vecLayer = useRef<VectorLayer>(null);

  const addRegion = (seq: number) => {
    if (vSource) removeRegion(vSource);
    axios
      .get(`/api/region/one?rgSeq=${seq}`)
      .then((res) => {
        const json = res.data?.rg_json;
        // data를 source로 변환
        const format = new GeoJSON({ featureProjection: 'EPSG:3857' });
        const features = format?.readFeatures(json);
        const vecSource = new VectorSource({ features });
        setVSource(vecSource);

        if (!vecLayer.current) {
          vecLayer.current = new VectorLayer({
            source: vecSource,
            style: {
              'fill-color': 'rgb(0, 119, 255, 0.1)',
              'stroke-color': 'rgb(0, 119, 255)',
              'stroke-width': 2,
              'circle-radius': 7,
              'circle-fill-color': '#ffcc33',
            },
          });

          map?.addLayer(vecLayer.current);
        } else {
          vecLayer.current.setSource(vecSource);
        }

        const geometry = features?.[0]?.getGeometry();
        const view = map?.getView();
        if (geometry && view) {
          const extent = createEmpty();
          extend(extent, geometry.getExtent());
          view.fit(extent, { duration: 500, padding: [150, 250, 150, 250] });
        }
        // maputils.moveMap(map, movePos, 17);
      })
      .catch((e) => console.error('E', e));
  };

  const removeRegion = (source: VectorSource<Feature<Geometry>> | undefined) => {
    source?.clear();
    setVSource(undefined);
  };

  const handleItemClick = (_e, rg_seq: number) => {
    addRegion(rg_seq);
  };

  const handleClickDelete = (e: React.MouseEvent, rg: IfTbRegion) => {
    e.preventDefault();
    e.stopPropagation();
    // 삭제 처리.
    axios
      .post('/api/region/delete', rg)
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
            {list?.length === 0 ? <MenuItem>등록된 구역이 없습니다.</MenuItem> : ''}
            {list?.map((ele) => (
              <MenuItem key={ele.rg_seq} onClick={(e) => handleItemClick(e, ele?.rg_seq || 0)}>
                <LocationOnIcon sx={{ width: 20, height: 20, color: '#FFCA28' }} />
                &nbsp;
                {ele.rg_nm}
                <Box flexGrow={1} />
                <IconButton
                  aria-label='delete'
                  size='small'
                  onClick={(e) => handleClickDelete(e, ele)}
                >
                  <SvgIcon>
                    <MdDeleteForever color='#ff6347' />
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
  background-color: #2e4a8f;
  color: #fff;
  padding: 0px 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-height: 35px;
  border-bottom: 1px solid rgba(102, 157, 252, 0.33);
  font-size: small;
  &:hover {
    background-color: #1f397b;
  }
`;
