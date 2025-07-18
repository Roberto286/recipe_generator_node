export function sendBadRequest(res, msg) {
  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `Bad Request: ${msg}` }));
  return;
}
