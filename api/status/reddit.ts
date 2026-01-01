type RedditRssItem = {
  title?: string;
  link?: string;
};

const extractFirstTag = (xml: string, tag: string): string | undefined => {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const m = xml.match(re);
  if (!m) return undefined;
  return m[1]?.trim();
};

const decodeCdata = (v?: string): string | undefined => {
  if (!v) return v;
  return v.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
};

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const username = process.env.REDDIT_USERNAME;
  if (!username) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(200).json({ ok: false, message: "reddit: not configured" });
    return;
  }

  try {
    const upstreamRes = await fetch(`https://www.reddit.com/user/${encodeURIComponent(username)}/submitted.rss`, {
      headers: {
        "User-Agent": "matty.lol",
      },
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      res
        .status(upstreamRes.status)
        .json({ ok: false, error: "Upstream error", status: upstreamRes.status, body: text });
      return;
    }

    const xml = await upstreamRes.text();
    const items = xml.split(/<item>/i).slice(1);

    const firstItemRaw = items[0];
    const itemXml = firstItemRaw ? `<item>${firstItemRaw}` : "";

    const item: RedditRssItem = {
      title: decodeCdata(extractFirstTag(itemXml, "title")),
      link: decodeCdata(extractFirstTag(itemXml, "link")),
    };

    const title = item.title || "(no title)";

    const subredditMatch = title.match(/\(\s*r\/([^\)]+)\s*\)/i);
    const subreddit = subredditMatch?.[1];

    const msg = subreddit
      ? `reddit: last post in r/${subreddit} — ${title.replace(/\(\s*r\/[^\)]+\s*\)/i, "").trim()}`
      : `reddit: ${title}`;

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json({ ok: true, message: msg, link: item.link });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" });
  }
}
