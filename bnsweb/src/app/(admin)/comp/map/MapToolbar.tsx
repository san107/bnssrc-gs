import React, { useState } from 'react';
import * as maputils from '@/utils/map-utils';
import Feature from 'ol/Feature.js';
import VectorSource from 'ol/source/Vector.js';
import Geometry from 'ol/geom/Geometry.js';
import { Map as MapMap } from 'ol';
import { Draw, Snap } from 'ol/interaction';
import GeoJSON from 'ol/format/GeoJSON.js';
import { styled } from '@mui/material/styles';
import { Box, IconButton, Tooltip } from '@mui/material';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import PlaceIcon from '@mui/icons-material/Place';
import { useDlgInput } from '@/app/(admin)/comp/popup/DlgInput';
import { toast } from 'sonner';
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { IfTbRegion } from '@/models/tb_region';
import { MapRegions } from '@/app/(admin)/comp/map/region/MapRegions';
import { MapFavorites } from '@/app/(admin)/comp/map/fav/MapFavorites';
import { AdministrativeBoundaries } from '@/app/(admin)/comp/map/administrative/AdministrativeBoundaries';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { useMapOlClick } from '@/app/(admin)/comp/map/useMapOlClick';
import { StyledEngineProvider } from '@mui/material';
import PentagonIcon from '@mui/icons-material/Pentagon';
import BorderColorIcon from '@mui/icons-material/BorderColor';
// import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

type Props = {
  map: MapMap | null;
  source: VectorSource<Feature<Geometry>> | undefined;
};

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'absolute',
  '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
    top: theme.spacing(2),
    left: theme.spacing(2),
  },
}));

const iconButtonStyle = {
  color: '#33489c',
  backgroundColor: '#b8c7f5',
  width: '46px',
  height: '46px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '10px',
  boxShadow: '0 0 0 2px white',
  '&:hover': {
    color: '#fff',
    backgroundColor: '#3f51b5',
    cursor: 'pointer',
  },
};

const MapToolbar = ({ map, source }: Props) => {
  const [region, setRegion] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [subOpen, setSubOpen] = useState<boolean>(false);
  const [openRegions, setOpenRegions] = useState<boolean>(false);
  const [openFavorites, setOpenFavorites] = useState<boolean>(false);
  const [openAdministrative, setOpenAdministrative] = useState<boolean>(false);
  const [selDraw, setSelDraw] = useState<Draw | undefined>(undefined);
  const [selSnap, setSelSnap] = useState<Snap | undefined>(undefined);
  const [dlgInput, DlgInput] = useDlgInput();
  const { mutate } = useSWRConfig();

  useMapOlClick(() => {
    setOpenRegions(false);
    setOpenFavorites(false);
    setOpenAdministrative(false);
  });

  const handleClickToolbar = () => {
    setOpen(!open);
    if (subOpen) setSubOpen(false);
    if (region) handleClickRemoveRegion();
    if (openRegions) setOpenRegions(false);
    if (openFavorites) setOpenFavorites(false);
    if (openAdministrative) setOpenAdministrative(false);
  };

  const handleClickSubMenu = () => {
    setSubOpen(!subOpen);
    if (region) handleClickRemoveRegion();
    if (openRegions) setOpenRegions(!openRegions);
    if (openFavorites) setOpenFavorites(!openFavorites);
    if (openAdministrative) setOpenAdministrative(!openAdministrative);
  };

  const handleClickAddRegion = () => {
    setOpenRegions(false);
    setOpenFavorites(false);
    setRegion(true);
    const { draw, snap } = maputils.addDraw(map, source);
    setSelDraw(draw);
    setSelSnap(snap);
  };

  const handleClickRemoveRegion = () => {
    setRegion(false);
    maputils.removeDraw(map, source, selDraw, selSnap);
  };

  const handleClickSave = () => {
    const format = new GeoJSON({ featureProjection: 'EPSG:3857' });
    const features = source?.getFeatures();
    const json = features ? format.writeFeatures(features) : undefined;
    // console.log('json', json);

    if (!features || features?.length === 0) {
      toast.error('구역을 먼저 지정해주세요.');
      return;
    }

    dlgInput.current
      ?.show('지정구역 저장', ['사용할 지정구역 이름을 입력하여 주십시오'])
      .then((name) => {
        const param: IfTbRegion = { rg_nm: name, rg_json: json };
        axios
          .post('/api/region/save', param)
          .then((res) => {
            console.log('res is ', res.data);
            toast.success('지정한 구역을 저장하였습니다');
            // list mutate.
            mutate((key) => {
              if (Array.isArray(key)) {
                console.log('key', key);
                if (key?.[0].startsWith('/api/region/list')) {
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
      })
      .catch((e) => {
        console.error('E', e);
      })
      .finally(() => handleClickRemoveRegion());
  };

  const handleClickRegions = () => {
    setSubOpen(false);
    setOpenFavorites(false);
    setOpenRegions(!openRegions);
  };

  const handleClickFavorites = () => {
    setSubOpen(false);
    setOpenRegions(false);
    setOpenFavorites(!openFavorites);
  };

  // const handleClickAdministrative = () => {
  //   setSubOpen(false);
  //   setOpenRegions(false);
  //   setOpenFavorites(false);
  //   setOpenAdministrative(!openAdministrative);
  // };

  return (
    <div className='toolbar'>
      {subOpen ? (
        <Box className='draw-menu-box'>
          <Tooltip
            title='지정구역 저장'
            placement='left-start'
            slotProps={{
              tooltip: {
                sx: {
                  backgroundColor: '#ef4444',
                },
              },
            }}
          >
            <IconButton
              className={subOpen && region ? 'visable-y' : 'visable-n'}
              onClick={() => handleClickSave()}
              sx={iconButtonStyle}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
          {!region ? (
            <Tooltip
              title='구역지정'
              placement='left-start'
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ef4444',
                  },
                },
              }}
            >
              <IconButton
                className={subOpen ? 'visable-y' : 'visable-n'}
                onClick={() => handleClickAddRegion()}
                sx={iconButtonStyle}
              >
                <PentagonIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip
              title='구역지정 취소'
              placement='left-start'
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ef4444',
                  },
                },
              }}
            >
              <IconButton onClick={() => handleClickRemoveRegion()} sx={iconButtonStyle}>
                <UndoIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ) : (
        ''
      )}
      <Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
        <StyledEngineProvider injectFirst>
          <StyledSpeedDial
            ariaLabel='SpeedDial'
            icon={<SpeedDialIcon />}
            direction={'left'}
            onClick={handleClickToolbar}
            open={open}
          >
            <SpeedDialAction
              icon={<BorderColorIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleClickSubMenu();
              }}
            />
            <SpeedDialAction
              icon={<PlaceIcon />}
              tooltipTitle={'지정구역 목록'}
              tooltipPlacement='bottom'
              TooltipClasses={{
                tooltip: 'MuiSpeedDialAction-Tooltip',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClickRegions();
              }}
              FabProps={{ disabled: region }}
            />
            <SpeedDialAction
              icon={<BookmarksIcon />}
              tooltipTitle={'즐겨찾기 목록'}
              tooltipPlacement='bottom'
              TooltipClasses={{
                tooltip: 'MuiSpeedDialAction-Tooltip',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClickFavorites();
              }}
              FabProps={{ disabled: region }}
            />
            {/* <SpeedDialAction
              icon={<AccountBalanceIcon />}
              tooltipTitle={'행정구역 경계'}
              tooltipPlacement='bottom'
              TooltipClasses={{
                tooltip: 'MuiSpeedDialAction-Tooltip',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClickAdministrative();
              }}
              FabProps={{ disabled: false }}
            /> */}
          </StyledSpeedDial>
        </StyledEngineProvider>
      </Box>
      <DlgInput />
      <MapRegions open={openRegions} />
      <MapFavorites open={openFavorites} />
      <AdministrativeBoundaries open={openAdministrative} />
    </div>
  );
};

export default MapToolbar;
