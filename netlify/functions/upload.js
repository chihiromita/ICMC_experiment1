// CommonJS形式
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { filename, points } = body;

    // Dropbox API
    const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
    if (!DROPBOX_TOKEN) {
      throw new Error("DROPBOX_TOKEN is not set");
    }

    const url = "https://content.dropboxapi.com/2/files/upload";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DROPBOX_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: `/drawings/${filename}`,
          mode: "add",
          autorename: true,
          mute: false,
          strict_conflict: false
        }),
        "Content-Type": "application/octet-stream"
      },
      body: JSON.stringify(points) // JSON文字列を送信
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        statusCode: 500,
        body: `Dropbox upload failed: ${text}`
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Saved successfully!" })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
