export type ChangelogEntry = {
  date: string;
  title: string;
  items: string[];
  tags?: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-01-01",
    title: "Jupiter perps + market signals",
    items: [
      "Added live Jupiter perps open positions widget on the homepage.",
      "Added P/L coloring, signed P/L formatting, and mark-price trend coloring.",
      "Added BTC/ETH/SOL signals + Fear/Greed index widget.",
      "Added Trades page placeholder and Jupiter referral CTA.",
      "Added terminal prompt line above cards for consistent theme.",
    ],
    tags: ["trading", "ui", "data"],
  },
];
