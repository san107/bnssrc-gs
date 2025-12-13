'use client';
import { MapBrowserEvent } from 'ol';
import { useEffect } from 'react';

class MapClickCtx {
  callbacks: ((v: MapBrowserEvent<any>) => void)[] = [];
  addCallback: (fn: (v: MapBrowserEvent<any>) => void) => void = () => null;
  removeCallback: (fn: (v: MapBrowserEvent<any>) => void) => void = () => null;
}

function createMapClickManger() {
  const ctx = new MapClickCtx();
  ctx.callbacks = [];
  ctx.removeCallback = (fn: (v: MapBrowserEvent<any>) => void) => {
    const idx = ctx.callbacks.indexOf(fn);
    if (idx >= 0) {
      ctx.callbacks.splice(idx, 1);
    }
  };
  ctx.addCallback = (fn: (v: MapBrowserEvent<any>) => void) => {
    ctx.callbacks.push(fn);
  };

  return ctx;
}

const clickmgr: MapClickCtx = createMapClickManger();

export const broadcastMapOlClick = (e: MapBrowserEvent<any>) => {
  clickmgr.callbacks.forEach((fn) => fn(e));
};

export const useMapOlClick = (fn: (msg: MapBrowserEvent<any>) => void) => {
  useEffect(() => {
    clickmgr.addCallback(fn);
    return () => {
      clickmgr.removeCallback(fn);
    };
  }, [fn]);
};
