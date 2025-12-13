import { NumberField2 } from '@/app/(admin)/comp/input/NumberField';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTbl, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { useMobile } from '@/hooks/useMobile';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfLatLng, IfLatLngZoom, LatLng, LatLngZoom } from '@/models/models';
import { IfTbConfig } from '@/models/tb_config';
import { useConfigStore } from '@/store/useConfigStore';
import { gconf } from '@/utils/gconf';
import * as maputils from '@/utils/map-utils';
import { tofixed } from '@/utils/num-utils';
import CloseIcon from '@mui/icons-material/Close';
import RoomIcon from '@mui/icons-material/Room';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { Map, MapBrowserEvent, Overlay, View } from 'ol';
import { defaults } from 'ol/control';
import { Tile } from 'ol/layer';
import 'ol/ol.css';
import { fromLonLat, toLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: 'none',
      borderRadius: 0,
    },
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    minWidth: 400,
    minHeight: 170,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
      padding: theme.spacing(1),
    },
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const MapContainer = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 900,
  height: 450,
  [theme.breakpoints.down('sm')]: {
    height: 300,
  },
}));

const searchField = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#f5f5f5',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#eeeeee',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2196f3',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
        borderColor: '#2196f3',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#2196f3',
    },
  },
};

const searchButton = {
  width: '100px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: '#2196f3',
  boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#1976d2',
    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.4)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 1px 2px rgba(33, 150, 243, 0.3)',
  },
};

type Props = {
  show: (title: string, pos: IfLatLngZoom) => Promise<IfLatLngZoom>;
};
const def_zoom = 16;

export const DlgMap = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const promise = usePromise<IfLatLng, any>();
  const [title, setTitle] = React.useState('');
  const [pos, setPos] = useState<IfLatLngZoom>(new LatLngZoom());
  const { isMobile } = useMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searched, setSearched] = useState<boolean>(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    promise.current.reject?.({ cmd: 'close' });
  };

  const handleOk = () => {
    setOpen(false);
    promise.current.resolve?.(ctx.current.pos ? ctx.current.pos : new LatLng());
  };
  const { config } = useConfigStore();

  const ctx = useRef<{ map?: Map; marker?: Overlay; pos?: IfLatLngZoom; config: IfTbConfig }>({
    config: config,
  });
  ctx.current.pos = pos;
  useEffect(() => {
    ctx.current.config = config;
  }, [config]);

  const mapClick = (evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>) => {
    const map = ctx.current.map;
    if (map == null) {
      console.log('map is null ');
      return;
    }
    // console.info(evt.pixel);
    // console.info(map.getPixelFromCoordinate(evt.coordinate));
    // console.info(toLonLat(evt.coordinate));
    const coords = toLonLat(evt.coordinate);
    const lat = tofixed(coords[1], 7);
    const lng = tofixed(coords[0], 7);
    const locTxt = 'Latitude: ' + lat + ' Longitude: ' + lng;

    const v = evt.map.getView().getZoom();

    const zoom = v ? Math.round(v * 100) / 100 : v;
    setPos({ ...pos, zoom });
    //toast.info(locTxt);
    setPos({ lat, lng, zoom });
    ctx.current.marker?.setPosition(evt.coordinate);
    console.log(
      'locTxt:',
      locTxt,
      'setposition(lng-lat)',
      coords,
      'evt.coordinate',
      evt.coordinate
    );
  };

  const initMap = () => {
    const config = ctx.current.config;
    const marker = new Overlay({
      position: fromLonLat([
        ctx.current.pos?.lng || config.def_lng || gconf.defLng,
        ctx.current.pos?.lat || config.def_lat || gconf.defLat,
      ]),
      positioning: 'bottom-center',
      element: refMarker.current ? refMarker.current : undefined,
      stopEvent: false,
    });
    ctx.current.marker = marker;
    const map = new Map({
      controls: defaults({ zoom: true, rotate: false }).extend([]),
      layers: [
        // new Tile({
        //   source: new OSM(),
        // }),

        // VWorld Map
        new Tile({
          visible: true,
          source: new XYZ({
            url: maputils.getBaseUrl(),
          }),
        }),
      ],
      //target: "vwmap",
      target: refMap.current === null ? undefined : refMap.current,
      view: new View({
        center: fromLonLat([
          ctx.current.pos?.lng || config.def_lng || gconf.defLng,
          ctx.current.pos?.lat || config.def_lat || gconf.defLat,
        ]),
        zoom: ctx.current.pos?.zoom || def_zoom,
      }),
      overlays: [marker],
    });
    //console.log('map is ', map);
    ctx.current.map = map;

    map.on('click', mapClick);
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      show: (title: string, pos: IfLatLngZoom) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setTitle(title);
          ctx.current.pos = {
            lat: pos.lat || config.def_lat || gconf.defLat,
            lng: pos.lng || config.def_lng || gconf.defLng,
            zoom: pos.zoom || config.def_zoom || def_zoom,
          };
          setPos(ctx.current.pos);
          //console.log('show pos:', ctx.current.pos);

          handleClickOpen();
          setTimeout(() => initMap(), 50);
        });
      },
    })
  );

  const refMap = React.useRef<HTMLDivElement>(null);
  const refMarker = React.useRef<HTMLDivElement>(null);

  const handleClickMove = () => {
    //
    if (!pos?.lat || !pos?.lng) return;
    const coordinate = fromLonLat([pos?.lng, pos?.lat]);
    ctx.current.marker?.setPosition(coordinate);

    const map = ctx.current.map;

    map?.getView().setCenter(coordinate);
    if (pos?.zoom) map?.getView().setZoom(pos.zoom);
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    setSearched(true);

    axios
      .get(
        `/api/req/search?request=search&size=100&page=1&format=json&apiKey=${maputils.getApiKey()}&type=place&query=${searchQuery}`
      )
      .then((res) => {
        if (res.data.response.status === 'NOT_FOUND') {
          setSearchResults([]);
          return;
        }
        const items = res.data.response.result.items;
        setSearchResults(items || []);
      })
      .catch((err) => {
        console.log('err', err);
        setSearchResults([]);
      });
  };

  const handleSelectLocation = (item: any) => {
    // 위경도 값을 숫자로 변환하여 타입 오류 방지
    const lat = typeof item.point.y === 'string' ? parseFloat(item.point.y) : item.point.y;
    const lng = typeof item.point.x === 'string' ? parseFloat(item.point.x) : item.point.x;

    const coordinate = fromLonLat([lng, lat]);
    ctx.current.marker?.setPosition(coordinate);
    setPos({
      lat,
      lng,
      zoom: pos.zoom || def_zoom,
    });
    ctx.current.map?.getView().setCenter(coordinate);
    ctx.current.map?.getView().setZoom(18);
  };

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        open={open}
        maxWidth={false}
        closeAfterTransition={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, minHeight: 50 }}>{title}</DialogTitle>
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 0, alignItems: 'center' }}>
              <TextField
                fullWidth
                size='small'
                label='장소 검색'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                sx={searchField}
              />
              <Button
                variant='contained'
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                size='small'
                sx={searchButton}
              >
                검색
              </Button>

              <SettingBtn
                autoFocus
                onClick={handleClose}
                sx={{ width: '100px', height: '40px', borderRadius: '8px' }}
                btnType='cancel'
              >
                취소
              </SettingBtn>
              <SettingBtn
                autoFocus
                onClick={handleOk}
                sx={{ width: '100px', height: '40px', borderRadius: '8px' }}
                btnType='confirm'
              >
                선택
              </SettingBtn>
            </Box>
            <Box
              sx={{
                maxHeight: 190,
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: 1,
                mt: 2,
              }}
            >
              {searchResults.length > 0 ? (
                (searchResults || []).map((item, idx) => {
                  const address = item.address.road || item.address.parcel;
                  return (
                    <Box
                      key={idx}
                      sx={{
                        p: 1,
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f5f5f5' },
                      }}
                      onClick={() => handleSelectLocation(item)}
                    >
                      <Box sx={{ fontWeight: 'bold' }}>{item.title}</Box>
                      <Box sx={{ color: 'text.secondary', fontSize: '14px' }}>{address}</Box>
                    </Box>
                  );
                })
              ) : searched ? (
                <Box sx={{ p: 1, color: '#af1406', textAlign: 'center' }}>
                  검색된 항목이 없습니다.
                </Box>
              ) : null}
            </Box>
          </Box>

          <Box>
            <FormTbl width={'100%'}>
              <ColGrp cols={isMobile ? [0.3, 0.7] : [0.9, 2.2, 0.9, 2.2, 0.9, 0.9, 0.9]} />
              <tbody>
                {isMobile ? (
                  <>
                    <FormTr>
                      <FormTh>위도</FormTh>
                      <FormTd>
                        <NumberField2
                          fullWidth
                          value={pos.lat}
                          type='number'
                          onChange={(lat) => setPos({ ...pos, lat })}
                        />
                      </FormTd>
                    </FormTr>
                    <FormTr>
                      <FormTh>경도</FormTh>
                      <FormTd>
                        <NumberField2
                          fullWidth
                          value={pos.lng}
                          type='number'
                          onChange={(lng) => setPos({ ...pos, lng })}
                        />
                      </FormTd>
                    </FormTr>
                    <FormTr>
                      <FormTh>Zoom</FormTh>
                      <FormTd>
                        <NumberField2
                          fullWidth
                          value={pos.zoom}
                          type='number'
                          onChange={(v) => {
                            const zoom = v ? Math.round(v * 100) / 100 : def_zoom;
                            setPos({ ...pos, zoom });
                          }}
                        />
                      </FormTd>
                    </FormTr>
                    <FormTr>
                      <FormTd colSpan={2}>
                        <SettingBtn fullWidth onClick={handleClickMove} btnType='move'>
                          이동
                        </SettingBtn>
                      </FormTd>
                    </FormTr>
                  </>
                ) : (
                  <FormTr>
                    <FormTh>위도</FormTh>
                    <FormTd>
                      <NumberField2
                        fullWidth
                        value={pos.lat}
                        type='number'
                        onChange={(lat) => setPos({ ...pos, lat })}
                        onPaste={(e) => {
                          const text = e.clipboardData.getData('text');
                          if (text?.length > 0 && text?.split(',').length === 3) {
                            setTimeout(() => {
                              const [lat, lng, zoom] = text.split(',');
                              setPos({
                                ...pos,
                                lat: parseFloat(lat),
                                lng: parseFloat(lng),
                                zoom: parseFloat(zoom),
                              });
                            }, 200);
                          }
                        }}
                      />
                    </FormTd>
                    <FormTh>경도</FormTh>
                    <FormTd>
                      <NumberField2
                        fullWidth
                        value={pos.lng}
                        type='number'
                        onChange={(lng) => setPos({ ...pos, lng })}
                      />
                    </FormTd>
                    <FormTh>Zoom</FormTh>
                    <FormTd>
                      <NumberField2
                        fullWidth
                        value={pos.zoom}
                        type='number'
                        onChange={(v) => {
                          const zoom = v ? Math.round(v * 100) / 100 : def_zoom;
                          setPos({ ...pos, zoom });
                        }}
                      />
                    </FormTd>
                    <FormTd>
                      <SettingBtn fullWidth onClick={handleClickMove} btnType='move'>
                        이동
                      </SettingBtn>
                    </FormTd>
                  </FormTr>
                )}
              </tbody>
            </FormTbl>
          </Box>
          <div ref={refMarker}>
            <RoomIcon color='info' />
          </div>
          <MapContainer ref={refMap} />
        </Box>
      </BootstrapDialog>
    </React.Fragment>
  );
});

DlgMap.displayName = 'DlgMap';
export const useDlgMap = () => useRefComponent<Props>(DlgMap);
