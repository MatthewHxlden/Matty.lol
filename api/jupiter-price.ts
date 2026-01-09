export default async function handler(req: any, res: any) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.JUP_PORTFOLIO_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing JUP_PORTFOLIO_API_KEY" });
    return;
  }

  try {
    const { ids } = req.query;
    
    if (!ids || typeof ids !== "string") {
      res.status(400).json({ error: "Missing or invalid 'ids' parameter" });
      return;
    }

    const url = `https://api.jup.ag/price/v3?ids=${ids}`;
    
    const upstreamRes = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      res
        .status(upstreamRes.status)
        .json({ error: "Upstream error", status: upstreamRes.status, body: text });
      return;
    }

    const data = await upstreamRes.json();

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}
