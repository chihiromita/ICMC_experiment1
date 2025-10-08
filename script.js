const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");
const saveBtn = document.getElementById("saveBtn");
const nextBtn = document.getElementById("nextBtn");
const videoPlayer = document.getElementById("videoPlayer");

// 動画リスト（ファイル名）
const videos = ["A_1_1.mp4", "A_1_2.mp4", "A_2_1.mp4", "A_2_2.mp4"];
let randomizedVideos = [...videos].sort(() => Math.random() - 0.5);
let currentIndex = 0;

// 描画座標配列
let points = [];

// 背景画像読み込み
const img = new Image();
img.src = "stage.png";
img.onload = () => {
  loadVideo(currentIndex);
};

// --- 描画処理 ---
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
  points.push({ x, y });
}

// --- 動画読み込み ---
function loadVideo(index) {
  const videoSrc = randomizedVideos[index];
  videoPlayer.src = videoSrc;
  videoPlayer.load();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  points = [];
  status.textContent = "";

  initDrawing();
}

// --- 保存関数（失敗しても無視）---
async function autoSave(videoName) {
  if (points.length === 0) return;

  const participantId = crypto.randomUUID();
  const filename = `${participantId}_${videoName}.json`;

  try {
    await fetch("/.netlify/functions/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, points })
    });
    console.log(`自動保存完了: ${filename}`);
    points = [];
  } catch (e) {
    console.error("自動保存失敗:", e);
  }
}

// --- 保存ボタン ---
saveBtn.addEventListener("click", async () => {
  if (points.length === 0) {
    status.textContent = "描画がありません。";
    return;
  }

  status.textContent = "保存中…";
  const participantId = crypto.randomUUID();
  const filename = `${participantId}_${randomizedVideos[currentIndex]}.json`;

  try {
    const res = await fetch("/.netlify/functions/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, points })
    });

    if (res.ok) {
      status.textContent = "保存完了！";
      points = [];
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

// --- 次ページボタン ---
nextBtn.addEventListener("click", async () => {
  const currentVideoName = randomizedVideos[currentIndex];
  await autoSave(currentVideoName); // 保存失敗でも無視

  currentIndex++;
  if (currentIndex >= randomizedVideos.length) {
    alert("すべての動画を視聴しました。ご協力ありがとうございました！");
    return;
  }
  loadVideo(currentIndex);
});
