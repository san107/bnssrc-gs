import { IfLatLng, IfLatLngZoom } from '@/models/models';
import { Map as OlMap } from 'ol';
import { createEmpty, extend } from 'ol/extent';
import { fromLonLat } from 'ol/proj';

export const mapmove = {
  moveTo: (map: OlMap, pos: IfLatLngZoom) => {
    const view = map?.getView();
    if (!view) return;

    const { lat, lng, zoom } = pos;
    if (lat === undefined || lng === undefined) return;
    // Point is [lng, lat]

    view.animate({
      //center: new Point([lng, lat]).transform('EPSG:4326', 'EPSG:3857').getCoordinates(),
      center: fromLonLat([lng, lat]),
      zoom: zoom ? zoom : 18,
      duration: 500,
    });
  },
  extent: (map: OlMap, points: IfLatLng[]) => {
    const view = map?.getView();
    if (!view) return;

    const extent = createEmpty();
    points.forEach((ele) => {
      if (ele.lng === undefined || ele.lat === undefined) return;
      const p = fromLonLat([ele.lng, ele.lat]);
      extend(extent, [...p, ...p]);
    });

    const isMobile = window.innerWidth <= 768;
    const padding = isMobile ? [50, 50, 50, 50] : [150, 250, 150, 250];
    view.fit(extent, { duration: 500, padding });
  },
};
