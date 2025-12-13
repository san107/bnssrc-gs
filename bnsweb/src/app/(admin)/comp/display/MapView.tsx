import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { IfLatLngZoom, LatLngZoom } from '@/models/models';
import { IfTbConfig } from '@/models/tb_config';
import { useConfigStore } from '@/store/useConfigStore';
import { tofixed } from '@/utils/num-utils';
import RoomIcon from '@mui/icons-material/Room';
import { Box } from '@mui/material';
import { Map, MapBrowserEvent, Overlay, View } from 'ol';
import { defaults } from 'ol/control';
import { defaults as interactionDefaults } from 'ol/interaction';
import { Tile } from 'ol/layer';
import 'ol/ol.css';
import { fromLonLat, toLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import * as maputils from '@/utils/map-utils';
// import ChartWeatherPopBar from '@/app/(admin)/dashbd/dark/chart/ChartWeatherPopBar';
// import { IfWeather } from '@/models/weather';
import { gconf } from '@/utils/gconf';

type Props = {
  lat?: number;
  lng?: number;
  zoom?: number;
  width?: number | string;
  height?: number | string;
  ignoreClick?: boolean;
  midnight?: boolean;
  // pops?: IfWeather[];
  addr?: string;
  theme?: string;
};

export const MapView = ({
  lat,
  lng,
  zoom,
  width,
  height,
  ignoreClick,
  midnight,
  // pops,
  addr,
  theme,
}: Props) => {
  const [pos, setPos] = useState<IfLatLngZoom>(new LatLngZoom());

  const { config } = useConfigStore();

  const ctx = useRef<{ map?: Map; marker?: Overlay; pos?: IfLatLngZoom; config: IfTbConfig }>({
    config: config,
  });
  ctx.current.pos = pos;
  useEffect(() => {
    ctx.current.config = config;
  }, [config]);

  useEffect(() => {
    setPos({ lat: lat ?? pos.lat, lng: lng ?? pos.lng, zoom: zoom ?? pos.zoom });
    // eslint-disable-next-line
  }, [lat, lng, zoom]);

  useEffect(() => {
    const mapClick = (evt: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>) => {
      const map = ctx.current.map;
      if (map == null) {
        console.log('map is null ');
        return;
      }
      if (ignoreClick) return; // ignore click event
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

    const config = ctx.current.config;
    const pos = ctx.current.pos;
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
      interactions: interactionDefaults({
        pinchZoom: false,
        doubleClickZoom: false,
        dragPan: false,
        mouseWheelZoom: false,
      }),
      controls: defaults({ zoom: midnight ? false : true, rotate: false }).extend([]),
      layers: [
        // new Tile({
        //   source: new OSM(),
        // }),

        // VWorld Map
        new Tile({
          visible: true,
          source: new XYZ({
            url: midnight ? maputils.getBaseUrlMidnight() : maputils.getBaseUrl(),
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
        zoom: pos?.zoom ?? 15,
      }),
      overlays: [marker],
    });
    // console.log('map is ', map);
    ctx.current.map = map;

    map.on('click', mapClick);
    return () => map.dispose();
  }, [ignoreClick, midnight]);

  const refMap = React.useRef<HTMLDivElement>(null);
  const refMarker = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // console.log('pos changed', pos);
    if (!pos?.lat || !pos?.lng) return;
    const coordinate = fromLonLat([pos?.lng, pos?.lat]);
    ctx.current.marker?.setPosition(coordinate);

    const map = ctx.current.map;

    map?.getView().setCenter(coordinate);
    if (pos.zoom !== undefined) map?.getView().setZoom(pos.zoom);
    // console.log('change.... ', pos);
  }, [pos]);

  //   const handleClickMove = () => {
  //     //
  //     if (!pos?.lat || !pos?.lng) return;
  //     const coordinate = fromLonLat([pos?.lng, pos?.lat]);
  //     ctx.current.marker?.setPosition(coordinate);

  //     const map = ctx.current.map;

  //     map?.getView().setCenter(coordinate);
  //     if (pos?.zoom) map?.getView().setZoom(pos.zoom);
  //   };

  return (
    <React.Fragment>
      {/* {midnight && ( */}
      <Box className='map-weather-box'>
        <Box className='map-weather' style={{ textAlign: 'center' }}>
          {/* 강수량 데이터가 너무 많은 곳에서 표기되는 것 같아 주석처리 */}
          {/* <ChartWeatherPopBar data={pops} addr={addr} /> */}
          <span
            style={{
              color: theme === 'dark' ? '#99ABB7' : '#2E4A8F',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {addr}
          </span>
        </Box>
      </Box>
      {/* )} */}

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <div ref={refMarker}>
          <RoomIcon color='info' className={midnight ? 'bounce-marker' : 'bounce-marker-light'} />
        </div>
        <div ref={refMap} style={{ width, height }}></div>
      </Box>
    </React.Fragment>
  );
};
