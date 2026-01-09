const WALLET_ADDRESS = "9NuiHh5wgRPx69BFGP1ZR8kHiBENGoJrXs5GpZzKAyn8";

export default async function handler(req: any, res: any) {
  console.log("=== Jupiter Positions API Call ===");
  console.log("Method:", req.method);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("URL:", req.url);
  
  if (req.method && req.method !== "GET") {
    console.log("Method not allowed:", req.method);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.JUP_PORTFOLIO_API_KEY;
  console.log("API Key exists:", !!apiKey);
  console.log("API Key length:", apiKey?.length);
  
  if (!apiKey) {
    console.log("Missing API key");
    res.status(500).json({ error: "Missing JUP_PORTFOLIO_API_KEY" });
    return;
  }

  try {
    const url = `https://api.jup.ag/portfolio/v1/positions/${WALLET_ADDRESS}`;
    console.log("Fetching from:", url);
    
    const upstreamRes = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    console.log("Upstream response status:", upstreamRes.status);
    console.log("Upstream response headers:", JSON.stringify(Object.fromEntries(upstreamRes.headers), null, 2));
    
    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      console.log("Upstream error body:", text);
      console.log("=== END Jupiter Positions API Call (ERROR) ===");
      res
        .status(upstreamRes.status)
        .json({ error: "Upstream error", status: upstreamRes.status, body: text });
      return;
    }

    const data = await upstreamRes.json();
    console.log("Success - data keys:", Object.keys(data));
    console.log("=== END Jupiter Positions API Call (SUCCESS) ===");

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    res.status(200).json(data);
  } catch (e) {
    console.error("API route error:", e);
    console.log("=== END Jupiter Positions API Call (EXCEPTION) ===");
    res.status(500).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}
