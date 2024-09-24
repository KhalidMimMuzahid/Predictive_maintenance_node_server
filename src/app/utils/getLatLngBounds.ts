export const getLatLngBounds = ({
  latitude,
  longitude,
  radiusInKm,
}: {
  latitude: number;
  longitude: number;
  radiusInKm: number;
}) => {
  // Radius of the Earth in kilometers
  const earthRadius = 6371;

  // Convert the radius from kilometers to degrees
  const latDelta = radiusInKm / earthRadius;
  const lonDelta =
    radiusInKm / (earthRadius * Math.cos((Math.PI * latitude) / 180));

  // Calculate the latitude boundaries
  const minLat = latitude - (latDelta * 180) / Math.PI;
  const maxLat = latitude + (latDelta * 180) / Math.PI;

  // Calculate the longitude boundaries
  const minLon = longitude - (lonDelta * 180) / Math.PI;
  const maxLon = longitude + (lonDelta * 180) / Math.PI;

  return {
    latitude: {
      min: minLat,
      max: maxLat,
    },
    longitude: {
      min: minLon,
      max: maxLon,
    },
  };
};
