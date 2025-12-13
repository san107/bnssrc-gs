'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Button } from '@mui/material';
//import { Inter } from "next/font/google";
import { useRefCtx } from '@/hooks/useRefCtx';
import { Map, MapBrowserEvent, View } from 'ol';
import { defaults } from 'ol/control';
import { Tile } from 'ol/layer';
import 'ol/ol.css';
import { fromLonLat, toLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import * as maputils from '@/utils/map-utils';
import { gconf } from '@/utils/gconf';

//const inter = Inter({ subsets: ["latin"] });

export default function Index() {
  const ctx = useRef<{ map?: Map }>({});
  const refs = useRefCtx({ addLogs: (msgs: string[]) => setLogs([...msgs, ...logs.slice(0, 20)]) });

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
    const lat = coords[1];
    const lng = coords[0];
    const locTxt = 'Latitude: ' + lat + ' Longitude: ' + lng;

    //toast.info(locTxt);
    // ctx.current.pos = { lat, lng };
    // ctx.current.marker?.setPosition(evt.coordinate);
    refs.current?.addLogs([locTxt]);
    console.log(
      'locTxt:',
      locTxt,
      'setposition(lng-lat)',
      coords,
      'evt.coordinate',
      evt.coordinate
    );
  };

  useEffect(() => {
    const ctxcurr = ctx.current;
    // create Map instance
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
        center: fromLonLat([gconf.defLng, gconf.defLat]),
        zoom: 15,
      }),
    });
    ctxcurr.map = map;

    map.on('click', mapClick);

    console.log('map is ', map);
    return () => map.dispose();
    // eslint-disable-next-line
  }, []);
  const refMap = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const btns: [string, MouseEventHandler<HTMLButtonElement>][] = [
    ['reload', () => document.location.reload()],
    ['테스트로그', () => refs.current?.addLogs(['test 1 ' + new Date().toLocaleString()])],
    ['log clear', () => setLogs([])],
    [
      'set center',
      () => {
        const map = ctx.current.map;
        if (!map) return;
        map.getView().setCenter(fromLonLat([gconf.defLng, gconf.defLat]));
      },
    ],
    [
      'change zoom+',
      () => {
        const map = ctx.current.map;
        if (!map) return;
        const zoom = (map.getView().getZoom() || 20) + 1;
        refs.current?.addLogs(['set zoom + ' + zoom]);
        map.getView().setZoom(zoom);
      },
    ],
    [
      'change zoom-',
      () => {
        const map = ctx.current.map;
        if (!map) return;
        const zoom = (map.getView().getZoom() || 20) - 1;
        refs.current?.addLogs(['set zoom - ' + zoom]);
        map.getView().setZoom(zoom);
      },
    ],
  ];

  return (
    <main>
      <h2>VWorld Map Test</h2>
      <div className='w-full flex items-start'>
        <div
          //id="vwmap"
          ref={refMap}
          style={{ width: 700, height: 500, border: '1px solid red' }}
        ></div>
        <div className='flex flex-col'>
          <div
            className='flex flex-wrap'
            css={css`
              & button {
                margin: 3px;
              }
            `}
          >
            {btns.map(([str, fn]) => (
              <Button key={str} onClick={fn}>
                {str}
              </Button>
            ))}
          </div>
          <div>
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
