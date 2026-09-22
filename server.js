import { createServer } from "http";
import { parse } from "url";
import next from "next";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

// Load .env configuration automatically
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "9009", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
