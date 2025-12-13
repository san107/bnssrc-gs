'use client';
import { gconf } from '@/utils/gconf';
//import { Inter } from "next/font/google";
import { Map, View } from 'ol';
import { defaults } from 'ol/control';
import { Tile } from 'ol/layer';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import { useEffect, useRef } from 'react';

//const inter = Inter({ subsets: ["latin"] });

export default function Main() {
  useEffect(() => {
    // create Map instance
    const map = new Map({
      controls: defaults({ zoom: true, rotate: false }).extend([]),
      layers: [
        new Tile({
          source: new OSM(),
        }),
      ],
      //target: "map",
      target: refMap.current === null ? undefined : refMap.current,
      view: new View({
        center: fromLonLat([gconf.defLng, gconf.defLat]),
        zoom: 15,
      }),
    });
    return () => map.dispose();
  }, []);
  const refMap = useRef<HTMLDivElement>(null);
  return (
    <main>
      <h2>VWorld Map Test</h2>
      <div
        //id="map"
        ref={refMap}
        style={{ width: 500, height: 500, border: '1px solid red' }}
      ></div>
    </main>
  );
}
