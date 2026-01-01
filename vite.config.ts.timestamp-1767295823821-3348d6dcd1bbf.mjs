// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/Admin/Desktop/mattys-cyberden/matty-s-cyber-den/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Admin/Desktop/mattys-cyberden/matty-s-cyber-den/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Admin/Desktop/mattys-cyberden/matty-s-cyber-den/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\Desktop\\mattys-cyberden\\matty-s-cyber-den";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      mode === "development" && {
        name: "local-jupiter-positions-api",
        configureServer(server) {
          server.middlewares.use("/api/jupiter-positions", async (req, res, next) => {
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
                    "x-api-key": apiKey
                  }
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
                    body: text
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
                  error: e instanceof Error ? e.message : "Unknown error"
                })
              );
            }
          });
        }
      },
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEZXNrdG9wXFxcXG1hdHR5cy1jeWJlcmRlblxcXFxtYXR0eS1zLWN5YmVyLWRlblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5cXFxcRGVza3RvcFxcXFxtYXR0eXMtY3liZXJkZW5cXFxcbWF0dHktcy1jeWJlci1kZW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluL0Rlc2t0b3AvbWF0dHlzLWN5YmVyZGVuL21hdHR5LXMtY3liZXItZGVuL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmXHJcbiAgICAgICh7XHJcbiAgICAgICAgbmFtZTogXCJsb2NhbC1qdXBpdGVyLXBvc2l0aW9ucy1hcGlcIixcclxuICAgICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBhbnkpIHtcclxuICAgICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoXCIvYXBpL2p1cGl0ZXItcG9zaXRpb25zXCIsIGFzeW5jIChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVxLm1ldGhvZCAmJiByZXEubWV0aG9kICE9PSBcIkdFVFwiKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIk1ldGhvZCBub3QgYWxsb3dlZFwiIH0pKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGFwaUtleSA9IGVudi5KVVBfUE9SVEZPTElPX0FQSV9LRVk7XHJcbiAgICAgICAgICAgIGlmICghYXBpS2V5KSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIk1pc3NpbmcgSlVQX1BPUlRGT0xJT19BUElfS0VZXCIgfSkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCB1cHN0cmVhbVJlcyA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgICAgICAgXCJodHRwczovL2FwaS5qdXAuYWcvcG9ydGZvbGlvL3YxL3Bvc2l0aW9ucy85TnVpSGg1d2dSUHg2OUJGR1AxWlI4a0hpQkVOR29KclhzNUdwWnpLQXluOFwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogYXBpS2V5LFxyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICghdXBzdHJlYW1SZXMub2spIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCB1cHN0cmVhbVJlcy50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IHVwc3RyZWFtUmVzLnN0YXR1cztcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChcclxuICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBcIlVwc3RyZWFtIGVycm9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB1cHN0cmVhbVJlcy5zdGF0dXMsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogdGV4dCxcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdXBzdHJlYW1SZXMuanNvbigpO1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChcclxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgICAgZXJyb3I6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwiLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICB9KSBhcyBhbnksXHJcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1csU0FBUyxjQUFjLGVBQWU7QUFDNVksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFNBQVMsaUJBQ047QUFBQSxRQUNDLE1BQU07QUFBQSxRQUNOLGdCQUFnQixRQUFhO0FBQzNCLGlCQUFPLFlBQVksSUFBSSwwQkFBMEIsT0FBTyxLQUFVLEtBQVUsU0FBYztBQUN4RixnQkFBSSxJQUFJLFVBQVUsSUFBSSxXQUFXLE9BQU87QUFDdEMsa0JBQUksYUFBYTtBQUNqQixrQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsa0JBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxPQUFPLHFCQUFxQixDQUFDLENBQUM7QUFDdkQ7QUFBQSxZQUNGO0FBRUEsa0JBQU0sU0FBUyxJQUFJO0FBQ25CLGdCQUFJLENBQUMsUUFBUTtBQUNYLGtCQUFJLGFBQWE7QUFDakIsa0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELGtCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2xFO0FBQUEsWUFDRjtBQUVBLGdCQUFJO0FBQ0Ysb0JBQU0sY0FBYyxNQUFNO0FBQUEsZ0JBQ3hCO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxTQUFTO0FBQUEsb0JBQ1AsYUFBYTtBQUFBLGtCQUNmO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBRUEsa0JBQUksQ0FBQyxZQUFZLElBQUk7QUFDbkIsc0JBQU0sT0FBTyxNQUFNLFlBQVksS0FBSztBQUNwQyxvQkFBSSxhQUFhLFlBQVk7QUFDN0Isb0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG9CQUFJO0FBQUEsa0JBQ0YsS0FBSyxVQUFVO0FBQUEsb0JBQ2IsT0FBTztBQUFBLG9CQUNQLFFBQVEsWUFBWTtBQUFBLG9CQUNwQixNQUFNO0FBQUEsa0JBQ1IsQ0FBQztBQUFBLGdCQUNIO0FBQ0E7QUFBQSxjQUNGO0FBRUEsb0JBQU0sT0FBTyxNQUFNLFlBQVksS0FBSztBQUNwQyxrQkFBSSxhQUFhO0FBQ2pCLGtCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxrQkFBSSxJQUFJLEtBQUssVUFBVSxJQUFJLENBQUM7QUFBQSxZQUM5QixTQUFTLEdBQUc7QUFDVixrQkFBSSxhQUFhO0FBQ2pCLGtCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxrQkFBSTtBQUFBLGdCQUNGLEtBQUssVUFBVTtBQUFBLGtCQUNiLE9BQU8sYUFBYSxRQUFRLEVBQUUsVUFBVTtBQUFBLGdCQUMxQyxDQUFDO0FBQUEsY0FDSDtBQUFBLFlBQ0Y7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0YsU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDNUMsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUNoQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsRUFDQTtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
