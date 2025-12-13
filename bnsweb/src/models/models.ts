export class LatLng {
  lat?: number;
  lng?: number;
}

export interface IfLatLng extends LatLng {}

export class LatLngZoom {
  lat?: number;
  lng?: number;
  zoom?: number;
}

export interface IfLatLngZoom extends LatLngZoom {}
