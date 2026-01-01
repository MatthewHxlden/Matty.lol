export default async function handler(req: any, res: any) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const latRaw = process.env.WEATHER_LAT;
  const lonRaw = process.env.WEATHER_LON;
  if (!latRaw || !lonRaw) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(200).json({ ok: false, message: "external conditions: weather not configured" });
    return;
  }

  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(200).json({ ok: false, message: "external conditions: invalid coordinates" });
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
