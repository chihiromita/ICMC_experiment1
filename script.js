const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

// 描画座標を保存する配列
let points = [];

// 背景画像読み込み
const img = new Image();
img.src = "stage.png";
img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  initDrawing();
};

function initDrawing() {
  let drawing = false;

  canvas.addEventListener("mousedown", e => {
    drawing = true;
    draw(e);
  });
  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mousemove", e => {
    if (!drawing) return;
    draw(e);
  });
}

function draw(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.fillStyle = "rgba(255,0,0,0.7)";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  // 描画した座標を保存
  points.push({ x, y });
}

// 保存ボタンの処理
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (points.length === 0) {
    status.textContent = "描画がありません。";
    return;
  }

  status.textContent = "保存中…";

  // 参加者ID（ランダム）＋タイムスタンプ
  const participantId = crypto.randomUUID();
  const filename = `${participantId}_video1.json`;

  try {
    // 🔸 Netlify Functions にPOST送信
    const res = await fetch("/.netlify/functions/upload-drawing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename,
        points // JSON形式のまま送る
      })
    });

    if (res.ok) {
      status.textContent = "保存完了！";
      points = []; // 保存後リセット
    } else {
      const errorText = await res.text();
      status.textContent = "保存に失敗しました: " + errorText;
      console.error("保存エラー:", errorText);
    }
  } catch (e) {
    console.error("通信エラー:", e);
    status.textContent = "保存中にエラーが発生しました";
  }
});
