import http from "node:http";
import { downloadVideo } from "./video/processor.js";
import { extractBodyFromRequest } from "./lib/extract-body-from-request.js";
const PORT = process.env.PORT || 3000;

http
  .createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    if (req.url !== "/recipe") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
      return;
    }
    const body = await extractBodyFromRequest(req);
    const url = body?.url;
    if (!url) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bad Request: 'url' is required" }));
      return;
    }
    await downloadVideo(url);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Recipe generated successfully!" }));
  })
  .listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
  });
