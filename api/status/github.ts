export default async function handler(req: any, res: any) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const owner = process.env.GITHUB_OWNER || "MatthewHxlden";
  const repo = process.env.GITHUB_REPO || "matty.lol";
  if (!owner || !repo) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(200).json({ ok: false, message: "github: not configured" });
    return;
  }

  try {
    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, {
      headers: {
        "User-Agent": "matty.lol",
        Accept: "application/vnd.github+json",
      },
    });

    if (!commitsRes.ok) {
      const text = await commitsRes.text();
      res
        .status(commitsRes.status)
        .json({ ok: false, error: "Upstream error", status: commitsRes.status, body: text });
      return;
    }

    const commits = (await commitsRes.json()) as any[];
    const c0 = commits?.[0];
    const sha = typeof c0?.sha === "string" ? c0.sha.slice(0, 7) : undefined;
    const msg = typeof c0?.commit?.message === "string" ? c0.commit.message.split("\n")[0] : undefined;

    const message = sha && msg ? `github: ${owner}/${repo} @ ${sha} — ${msg}` : `github: ${owner}/${repo} (latest)`;

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=1800");
    res.status(200).json({ ok: true, message });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" });
  }
}
