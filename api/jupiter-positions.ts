const WALLET_ADDRESS = "9NuiHh5wgRPx69BFGP1ZR8kHiBENGoJrXs5GpZzKAyn8";

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
    const upstreamRes = await fetch(
      `https://api.jup.ag/portfolio/v1/positions/${WALLET_ADDRESS}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

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
