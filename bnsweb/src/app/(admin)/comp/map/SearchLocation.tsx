'use client';
import React, { useRef, useState } from 'react';
import * as maputils from '@/utils/map-utils';
import { copyText } from '@/utils/str-utils';
import { useMapOlClick } from '@/app/(admin)/comp/map/useMapOlClick';
import { mapStore } from '@/store/mapStore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, MenuItem, Select, TextField } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import { fromLonLat } from 'ol/proj';
import axios from 'axios';
import { useMobile } from '@/hooks/useMobile';

const BookNav = styled(List)<{ component?: React.ElementType }>({
  '& .MuiListItemButton-root': {
    paddingLeft: 24,
    paddingRight: 24,
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 16,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
});

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton disableFocusRipple={expand} {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const SearchLocation = () => {
  const [expanded, setExpanded] = useState(false);
  const { map } = mapStore();
  const typeRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const hasMarker = React.useRef<any>(null);
  const { isMobile } = useMobile();

  useMapOlClick(() => {
    setExpanded(false);
    if (hasMarker.current) maputils.removePlace(map, hasMarker.current);
  });

  const handleSearch = () => {
    console.log('type', typeRef.current?.value);
    const type = typeRef.current?.value;

    if (type === 'place') searchPlace();
    else if (type === 'camera') searchCamera();
    else if (type === 'gate') searchGate();
    else if (type === 'water') searchWater();
  };

  const initData = () => {
    const addrList = document.getElementById('address-list');
    if (addrList) addrList.innerHTML = '';
    if (queryRef.current) queryRef.current.value = '';
    if (nameRef.current) nameRef.current.value = '';
    if (lngRef.current) lngRef.current.value = '';
    if (latRef.current) latRef.current.value = '';
  };

  const handleChange = () => {
    initData();
  };

  const handleExpandClick = () => {
    initData();
    setExpanded(!expanded);
  };

  // 장소 검색
  const searchPlace = () => {
    const addrList = document.getElementById('address-list');
    axios
      .get(
        `/api/req/search?request=search&size=100&page=1&format=json&apiKey=${maputils.getApiKey()}&type=place&query=${
          queryRef.current?.value
        }`
      )
      .then((res) => {
        // console.log('res.data', res.data.response.result.items);
        if (res.data.response.status === 'NOT_FOUND') {
          noneData();
          return;
        }
        const items = res.data.response.result.items;
        if (addrList) addrList.innerHTML = '';
        items?.map((item, idx) => {
          if (addrList) {
            // 도로명주소가 없을때 지번주소가 나오게 처리
            let address = item.address.road; // ROAD : 도로명주소
            if (address === '') address = item.address.parcel; // PARCEL : 지번주소
            addrList.innerHTML += `<span class='copy' id='copy-address-${idx}'>복사</span><div class='address-list-item' id='address-list-${idx}'><strong>${item.title}</strong><p style='color:#9f9898'>${address}</p></div>`;
          }
        });
        items?.map((item, idx) => {
          let address = item.address.road; // ROAD : 도로명주소
          if (address === '') address = item.address.parcel; // PARCEL : 지번주소

          const selAddr = document.getElementById(`address-list-${idx}`);
          selAddr?.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('point', item.point);
            const coordinate = fromLonLat([item.point.x, item.point.y]);
            if (hasMarker.current) maputils.removePlace(map, hasMarker.current);
            hasMarker.current = maputils.addPlace(map, coordinate, 18, address);
            if (nameRef.current) nameRef.current.value = item.title;
            if (lngRef.current) lngRef.current.value = item.point.x;
            if (latRef.current) latRef.current.value = item.point.y;
          });

          const copyAddr = document.getElementById(`copy-address-${idx}`);
          copyAddr?.addEventListener('click', (e) => {
            e.preventDefault();
            // maputils.copyAddress(address);
            copyText(address, '주소');
          });
        });
      })
      .catch((err) => {
        console.log('err', err);
        noneData();
      });
  };

  // 카메라 검색
  const searchCamera = () => {
    const addrList = document.getElementById('address-list');
    axios
      .get(`/api/camera/searchlist?camNm=${queryRef.current?.value}`)
      .then((res) => {
        console.log('res.data', res.data);
        if (addrList) addrList.innerHTML = '';
        const data = res.data;
        if (data?.length === 0) {
          noneData();
        }
        data?.map((item, idx) => {
          if (addrList) {
            addrList.innerHTML += `<div class='address-list-item' id='address-list-${idx}'><strong>${item.cam_nm}</strong><p style='color:#9f9898'>${item.cam_type}</p></div>`;
          }
        });
        data?.map((item, idx) => {
          const selAddr = document.getElementById(`address-list-${idx}`);
          selAddr?.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('point', item.point);
            maputils.moveMap(map, [item.cam_lng, item.cam_lat], 18);
            if (nameRef.current) nameRef.current.value = item.cam_nm;
            if (lngRef.current) lngRef.current.value = item.cam_lng;
            if (latRef.current) latRef.current.value = item.cam_lat;
          });
        });
      })
      .catch((err) => {
        console.log('err', err);
        noneData();
      });
  };

  // 차단장비 검색
  const searchGate = () => {
    const addrList = document.getElementById('address-list');
    axios
      .get(`/api/gate/searchlist?gateNm=${queryRef.current?.value}`)
      .then((res) => {
        // console.log('res.data', res.data);
        if (addrList) addrList.innerHTML = '';
        const data = res.data;
        if (data?.length === 0) {
          noneData();
        }
        data?.map((item, idx) => {
          if (addrList) {
            addrList.innerHTML += `<div class='address-list-item' id='address-list-${idx}'><strong>${item.gate_nm}</strong><p style='color:#9f9898'>${item.gate_ip}</p></div>`;
          }
        });
        data?.map((item, idx) => {
          const selAddr = document.getElementById(`address-list-${idx}`);
          selAddr?.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('point', item.point);
            maputils.moveMap(map, [item.gate_lng, item.gate_lat], 18);
            if (nameRef.current) nameRef.current.value = item.gate_nm;
            if (lngRef.current) lngRef.current.value = item.gate_lng;
            if (latRef.current) latRef.current.value = item.gate_lat;
          });
        });
      })
      .catch((err) => {
        console.log('err', err);
        noneData();
      });
  };

  // 수위계 검색
  const searchWater = () => {
    const addrList = document.getElementById('address-list');
    axios
      .get(`/api/water/searchlist?waterNm=${queryRef.current?.value}`)
      .then((res) => {
        // console.log('res.data', res.data);
        if (addrList) addrList.innerHTML = '';
        const data = res.data;
        if (data?.length === 0) {
          noneData();
        }
        data?.map((item, idx) => {
          if (addrList) {
            addrList.innerHTML += `<div class='address-list-item' id='address-list-${idx}'><strong>${item.water_nm}</strong><p style='color:#9f9898'>${item.water_type}</p></div>`;
          }
        });
        data?.map((item, idx) => {
          const selAddr = document.getElementById(`address-list-${idx}`);
          selAddr?.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('point', item.point);
            maputils.moveMap(map, [item.water_lng, item.water_lat], 18);
            if (nameRef.current) nameRef.current.value = item.water_nm;
            if (lngRef.current) lngRef.current.value = item.water_lng;
            if (latRef.current) latRef.current.value = item.water_lat;
          });
        });
      })
      .catch((err) => {
        console.log('err', err);
        noneData();
      });
  };

  // none data
  const noneData = () => {
    const addrList = document.getElementById('address-list');
    if (addrList) addrList.innerHTML = '';
    if (addrList) {
      addrList.innerHTML += `<div class='address-list-item'><strong><p style='color:#da8982'>검색된 항목이 없습니다.</p></div>`;
    }
  };

  return (
    <div className='bookmark'>
      <Box sx={{ display: 'flex' }}>
        <ThemeProvider
          theme={createTheme({
            palette: {
              mode: 'dark',
              primary: { main: '#ffca28' },
              background: { paper: '#23272e' },
            },
          })}
        >
          <Paper
            elevation={0}
            sx={{ maxWidth: isMobile ? 'auto' : 320, width: isMobile ? 'auto' : 400 }}
          >
            <BookNav component='nav' disablePadding>
              <ListItem component='div' disablePadding>
                {!expanded && isMobile ? (
                  <ListItem sx={{ height: 'auto', padding: '8px' }}>
                    <ListItemIcon
                      onClick={handleExpandClick}
                      sx={{ cursor: 'pointer', minWidth: 'auto' }}
                    >
                      <SearchIcon color='primary' />
                    </ListItemIcon>
                  </ListItem>
                ) : (
                  <ListItem sx={{ height: 80 }}>
                    <ListItemIcon>
                      <SearchIcon color='primary' />
                    </ListItemIcon>
                    <ListItemText
                      primary='위치 검색'
                      secondary='항목 선택 후 검색어를 입력해주세요.'
                      slotProps={{
                        primary: {
                          fontSize: 15,
                          fontWeight: 'medium',
                          lineHeight: '20px',
                          mb: '2px',
                        },
                        secondary: {
                          noWrap: true,
                          fontSize: 12,
                          lineHeight: '16px',
                          color: 'rgba(255,255,255,0.5)',
                        },
                      }}
                      sx={{ my: 0 }}
                    />
                    <ExpandMore
                      expand={expanded}
                      onClick={handleExpandClick}
                      aria-expanded={expanded}
                      aria-label='show more'
                    >
                      <ExpandMoreIcon />
                    </ExpandMore>
                  </ListItem>
                )}
              </ListItem>
              <Collapse in={expanded} timeout='auto' unmountOnExit>
                <form>
                  <Divider />
                  <table>
                    <colgroup>
                      <col style={{ width: '30%' }} />
                      <col style={{ width: '70%' }} />
                    </colgroup>
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td>이름</td>
                        <td>
                          <TextField
                            inputRef={nameRef}
                            fullWidth
                            size='small'
                            slotProps={{
                              input: {
                                readOnly: true,
                              },
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>경도</td>
                        <td>
                          <TextField
                            inputRef={lngRef}
                            fullWidth
                            size='small'
                            slotProps={{
                              input: {
                                readOnly: true,
                              },
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>위도</td>
                        <td>
                          <TextField
                            inputRef={latRef}
                            fullWidth
                            size='small'
                            slotProps={{
                              input: {
                                readOnly: true,
                              },
                            }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Divider />
                  <Box
                    sx={{
                      display: 'flex',
                      padding: '5px',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ width: '124px', paddingLeft: '10px', color: '#ffca28' }}>
                      항목선택
                    </Box>
                    <Select
                      inputRef={typeRef}
                      fullWidth
                      size='small'
                      color='primary'
                      defaultValue={'place'}
                      sx={{ color: '#42ac89' }}
                      onChange={() => handleChange()}
                    >
                      <MenuItem value={'place'} selected>
                        장소
                      </MenuItem>
                      {!isMobile && <MenuItem value={'camera'}>카메라</MenuItem>}
                      <MenuItem value={'gate'}>차단장비</MenuItem>
                      <MenuItem value={'water'}>수위계</MenuItem>
                    </Select>
                  </Box>
                  <Divider />
                  <Box sx={{ padding: '5px' }}></Box>
                  <Box sx={{ display: 'flex', padding: '5px', justifyContent: 'center' }}>
                    <TextField
                      fullWidth
                      size='small'
                      label='검색어 입력'
                      inputRef={queryRef}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    <Button variant='outlined' color='primary' onClick={handleSearch}>
                      검색
                    </Button>
                  </Box>
                  <div
                    id='address-list'
                    className='address-list'
                    style={{
                      overflowY: 'scroll',
                      width: '100%',
                      height: '450px',
                      fontSize: '12px',
                    }}
                  ></div>
                </form>
              </Collapse>
            </BookNav>
          </Paper>
        </ThemeProvider>
      </Box>
    </div>
  );
};

export default SearchLocation;
