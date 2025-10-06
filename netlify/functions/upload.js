import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
    const body = JSON.parse(event.body);
    const { filename, jsonData } = body;

    // Dropboxへアップロード
    const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DROPBOX_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: `/${filename}`,
          mode: "add",
          autorename: true,
          mute: false
        }),
        "Content-Type": "application/octet-stream"
      },
      body: Buffer.from(jsonData)
    });

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "アップロード成功", result })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
