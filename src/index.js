import http from "node:http";
import { sendBadRequest } from "./http/responses.js";
import { extractBodyFromRequest } from "./lib/extract-body-from-request.js";
import { startRecipeGeneration } from "./recipe/processor.js";

const PORT = process.env.PORT || 3000;
const REQUIRED_ENV_VARIABLES = ["OPENAI_API_KEY"];

checkEnv();

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
    let body;
    try {
      body = await extractBodyFromRequest(req);
    } catch (e) {
      console.error(e);
      return sendBadRequest(res, "body is not a valid JSON");
    }
    const url = body?.url;
    if (!url) {
      return sendBadRequest(res, "'url' is required");
    }

    try {
      await startRecipeGeneration(url);
    } catch (e) {
      console.log("e :>> ", e);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Recipe generated successfully!" }));
  })
  .listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
  });

function checkEnv() {
  const notValidVars = REQUIRED_ENV_VARIABLES.filter((v) => {
    const envVariable = process.env[v];
    return (
      envVariable === null || envVariable === undefined || envVariable === ""
    );
  });

  if (notValidVars?.length) {
    console.error(
      `Following environment variables: 
      ${notValidVars.join("\n ")}\nare required in order to use the program.\nMake sure to set them in your .env file`,
    );
    process.exit(1);
  }
}
