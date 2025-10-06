// upload-drawing.js
const fetch = require("node-fetch"); // node-fetch v2 を使う場合
const { Dropbox } = require("dropbox");

// 環境変数を参照
const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { filename, points } = JSON.parse(event.body);

    // Dropboxクライアント作成（リフレッシュトークンでアクセストークン自動取得）
    const dbx = new Dropbox({
      clientId: APP_KEY,
      clientSecret: APP_SECRET,
      refreshToken: REFRESH_TOKEN,
      fetch
    });

    // points配列を JSON 文字列に変換してアップロード
    const content = JSON.stringify(points);

    await dbx.filesUpload({
      path: `/ICMCexperiment1/${filename}`,
      contents: content,
      mode: "overwrite"
    });

    return { statusCode: 200, body: "Upload successful" };
  } catch (error) {
    console.error("Dropbox upload failed:", error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
