import { transcribeAudio } from "../ai/transcriber.js";
import { extractAudioFrom } from "../audio/processor.js";
import { Status } from "../enum/status.enum.js";
import { downloadVideo } from "../video/processor.js";

export async function startRecipeGeneration(url) {
  const videoInfo = await downloadVideo(url);

  if (videoInfo.status === Status.ERROR) {
    throw new Error("Video downloading failed");
  }

  const audioFilePath = await extractAudioFrom(videoInfo.filepath);

  if (!audioFilePath) {
    throw new Error("Audio extracting failed");
  }

  const { status, transcribedAudio } = await transcribeAudio(audioFilePath);
  if (status === Status.ERROR || !transcribedAudio) {
    throw new Error("Audio transcription failed");
  }

  console.log("transcribedAudio :>> ", transcribedAudio);
}
