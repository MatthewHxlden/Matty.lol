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
      "Fixed Solscan links in perps widgets to link to the correct position/account (not always SOL).",
      "Added navbar >_ command terminal shortcut and fixed its modal sizing on small screens.",
      "Added a scrolling status ticker across the top of the site.",
      "Added status integrations (weather/github/reddit) to power the top ticker.",
      "Defaulted ticker status sources to Rossendale weather + jaeswift Reddit when env vars are not set.",
      "Adjusted the command terminal modal to drop below the navbar instead of clipping off-screen.",
      "Fixed command terminal modal bottom clipping by improving scroll/padding.",
      "Replaced ticker $ markers with status icons (GitHub/Reddit/Weather/System).",
      "Moved the status ticker into its own bar below the navbar.",
      "Changed weather status display to Celsius.",
      "Made the rain toggle icon-only in the navbar.",
      "Synced homepage perps activity panel with the /trades session activity log.",
      "Added Trades Admin placeholder page for future trades settings.",
      "Added terminal prompt line above cards for consistent theme.",
    ],
    tags: ["trading", "ui", "data"],
  },
];
