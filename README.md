# Matty.lol

> Personal website
## About

Matty.lol is my personal website showcasing cryptocurrency trading insights, development tutorials, DeFi guides, custom apps, tools, and a tech blog. Built with modern web technologies and a terminal-inspired aesthetic.

## Features

- **Terminal-style UI** with cyberpunk aesthetics
- **Live crypto prices** (SOL, BTC, ETH, VVV, DIEM)
- **Trading tools** and portfolio tracking
- **Development blog** with tutorials and insights
- **Custom apps** and utilities
- **Responsive design** with mobile support
- **Dark theme** with neon accents

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Backend**: Supabase (authentication, database)
- **Deployment**: Vercel
- **Blockchain**: Solana Web3.js

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/MatthewHxlden/matty.lol.git

# Step 2: Navigate to the project directory
cd matty.lol

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── data/              # Static data and content
└── styles/            # Global styles
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Live Site

🌐 [https://matty.lol](https://matty.lol)

## Connect

- **GitHub**: [@MatthewHxlden](https://github.com/MatthewHxlden)
- **Discord**: MattyMonero

## License

MIT License
