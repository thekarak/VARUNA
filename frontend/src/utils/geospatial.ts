/* src/utils/geospatial.ts */
export interface BoundingBox {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export function calculateBoundingBox(
  center: Coordinate,
  radiusMeters: number
): BoundingBox {
  const earthRadius = 6371000; // meters
  const deltaRadius = radiusMeters / earthRadius;
  const latRad = (center.latitude * Math.PI) / 180;
  const deltaLat = (deltaRadius / earthRadius) * (180 / Math.PI);
  const deltaLon = (deltaRadius / (earthRadius * Math.cos(latRad))) * (180 / Math.PI);

  return {
    minLat: center.latitude - deltaLat,
    minLon: center.longitude - deltaLon,
    maxLat: center.latitude + deltaLat,
    maxLon: center.longitude + deltaLon,
  };
}

export function isWithinBoundingBox(
  coord: Coordinate,
  box: BoundingBox
): boolean {
  return (
    coord.latitude >= box.minLat &&
    coord.latitude <= box.maxLat &&
    coord.longitude >= box.minLon &&
    coord.longitude <= box.maxLon
  );
}