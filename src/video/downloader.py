import sys
import os
import yt_dlp

url = sys.argv[1] if len(sys.argv) > 1 else None

def download_video(url, output_path="files/videos") -> dict:
    """
    Downloads a video from the given url and saves it to the specified output path.

    Args:
      url (str): The url of the video to download.
      output_path (str): The path where the downloaded video will be saved. Defaults to "files/videos".

    Returns:
      dict: A dictionary containing the status of the download, the video metadata, and the filepath of the downloaded video.

    Examples:
      >>> download_video("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      {'status': 'success', 'metadata': {'title': 'Rick Astley - Never Gonna Give You Up (Video)', 'description': 'Rick Astley\'s official music video for “Never Gonna Give You Up” Listen to Rick Astley: https://RickAstley.lnk.to/_listenYD Subscribe to the official Rick As...'}, 'filepath': 'files/videos/dQw4w9WgXcQ.mp4'}
    """
    print("sto eseguendo il download del video")
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    ydl_opts = {
        "format": "best",
        "outtmpl": os.path.join(output_path, "%(id)s.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
            metadata = extract_metadata(info)
            # Get the output file path
            filename = ydl.prepare_filename(info)
            return {"status": "success", "metadata": metadata, "filepath": filename}
        except Exception as e:
            return {"status": "error", "message": str(e)}

download_video(url)