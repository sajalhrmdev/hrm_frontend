const cache = new Map<string, string>();
let lastCall = 0;

function cacheKey(lat: number, lng: number): string {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `${r(lat)},${r(lng)}`;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = cacheKey(lat, lng);
  if (cache.has(key)) return cache.get(key)!;

  const now = Date.now();
  if (now - lastCall < 1100) {
    await new Promise((r) => setTimeout(r, 1100 - (now - lastCall)));
  }
  lastCall = Date.now();

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "HRM-FieldTrack/1.0" } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const parts = [addr.road, addr.city_district || addr.city || addr.town || addr.village, addr.country].filter(Boolean);
    const display = parts.join(", ") || data.display_name || "Unknown";
    cache.set(key, display);
    return display;
  } catch {
    return "Unknown location";
  }
}
