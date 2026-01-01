export type ChangelogEntry = {
  date: string;
  title: string;
  items: string[];
  tags?: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-01-01",
    title: "Perps UI, admin hub, and theme upgrades",
    items: [
      "Added live Jupiter perps open positions widget on the homepage.",
      "Added P/L coloring, signed P/L formatting, and mark-price trend coloring.",
      "Added BTC/ETH/SOL signals + Fear/Greed index widget.",
      "Added Trades page session tracker (baseline-from-now, not historical).",
      "Added Site Admin hub (/admin) to access admin modules from one place.",
      "Made homepage mission.txt editable via Site Admin (site_profile.mission).",
      "Added rain theme toggle + background-only canvas rain effect.",
      "Added /now page (editable via admin).",
      "Embedded /links list into the Profile page.",
      "Fixed Vercel SPA routing so direct links like /now and /links load correctly.",
      "Added homepage + footer shortcuts for /now and /links.",
      "Added a homepage shortcut tile for /trades.",
      "Added Trades Admin placeholder page for future trades settings.",
      "Added terminal prompt line above cards for consistent theme.",
    ],
    tags: ["trading", "ui", "data"],
  },
];
