import { spawnAsync } from "../lib/spawn-async.js";

export async function downloadVideo(url) {
  const { stdout, stderr } = await spawnAsync("python", [
    "-u",
    "src/video/downloader.py",
    url,
  ]);
  //Non avevo sbatti di implementare il download del video in node quindi ho importato il downloader dalla versione in python e lo richiamiamo da qui

  console.log("stdout, stderr :>> ", stdout, stderr);
}
