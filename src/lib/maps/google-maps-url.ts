export function googleMapsUrl(options: {
  address: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  const { latitude, longitude } = options;
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
  const query = [options.address.trim(), options.city?.trim()]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
