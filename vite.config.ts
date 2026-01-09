import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" &&
      ({
        name: "local-jupiter-positions-api",
        configureServer(server: any) {
          server.middlewares.use("/api/jupiter-positions", async (req: any, res: any, next: any) => {
            if (req.method && req.method !== "GET") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            const apiKey = env.JUP_PORTFOLIO_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing JUP_PORTFOLIO_API_KEY" }));
              return;
            }

            try {
              const upstreamRes = await fetch(
                "https://api.jup.ag/portfolio/v1/positions/9NuiHh5wgRPx69BFGP1ZR8kHiBENGoJrXs5GpZzKAyn8",
                {
                  headers: {
                    "x-api-key": apiKey,
                  },
                }
              );

              if (!upstreamRes.ok) {
                const text = await upstreamRes.text();
                res.statusCode = upstreamRes.status;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "Upstream error",
                    status: upstreamRes.status,
                    body: text,
                  })
                );
                return;
              }

              const data = await upstreamRes.json();
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: e instanceof Error ? e.message : "Unknown error",
                })
              );
            }
          });

          server.middlewares.use("/api/jupiter-price", async (req: any, res: any, next: any) => {
            if (req.method && req.method !== "GET") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            const apiKey = env.JUP_PORTFOLIO_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing JUP_PORTFOLIO_API_KEY" }));
              return;
            }

            try {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const ids = url.searchParams.get('ids');
              
              if (!ids) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Missing 'ids' parameter" }));
                return;
              }

              const upstreamRes = await fetch(
                `https://api.jup.ag/price/v3?ids=${ids}`,
                {
                  headers: {
                    "x-api-key": apiKey,
                  },
                }
              );

              if (!upstreamRes.ok) {
                const text = await upstreamRes.text();
                res.statusCode = upstreamRes.status;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "Upstream error",
                    status: upstreamRes.status,
                    body: text,
                  })
                );
                return;
              }

              const data = await upstreamRes.json();
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: e instanceof Error ? e.message : "Unknown error",
                })
              );
            }
          });
        },
      }) as any,
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
