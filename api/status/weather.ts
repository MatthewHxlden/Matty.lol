export default async function handler(req: any, res: any) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const latRaw = process.env.WEATHER_LAT;
  const lonRaw = process.env.WEATHER_LON;

  let lat = Number(latRaw);
  let lon = Number(lonRaw);

  try {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      const geoRes = await fetch(
        "https://geocoding-api.open-meteo.com/v1/search?name=Rossendale%2C%20Lancashire&count=1&language=en&format=json"
      );
      if (geoRes.ok) {
        const geo = (await geoRes.json()) as any;
        const first = geo?.results?.[0];
        const geoLat = typeof first?.latitude === "number" ? first.latitude : undefined;
        const geoLon = typeof first?.longitude === "number" ? first.longitude : undefined;
        if (typeof geoLat === "number" && typeof geoLon === "number") {
          lat = geoLat;
          lon = geoLon;
        }
      }
    }
  } catch {
    // swallow geocoding errors; we'll fall back to a friendly message below
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(200).json({ ok: false, message: "external conditions: weather unavailable" });
    return;
  }

  try {
    const upstreamRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(String(lat))}&longitude=${encodeURIComponent(
        String(lon)
      )}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
    );

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      res
        .status(upstreamRes.status)
        .json({ ok: false, error: "Upstream error", status: upstreamRes.status, body: text });
      return;
    }

    const data = (await upstreamRes.json()) as any;

    const current = data?.current;
    const temp = typeof current?.temperature_2m === "number" ? current.temperature_2m : undefined;
    const feels = typeof current?.apparent_temperature === "number" ? current.apparent_temperature : undefined;
    const wind = typeof current?.wind_speed_10m === "number" ? current.wind_speed_10m : undefined;

    const parts: string[] = [];
    if (typeof temp === "number") parts.push(`${Math.round(temp)}°F`);
    if (typeof feels === "number") parts.push(`feels ${Math.round(feels)}°F`);
    if (typeof wind === "number") parts.push(`wind ${Math.round(wind)}mph`);

    const message = parts.length > 0 ? `external conditions: ${parts.join(" | ")}` : "external conditions: unavailable";

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=1800");
    res.status(200).json({ ok: true, message });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" });
  }
}
