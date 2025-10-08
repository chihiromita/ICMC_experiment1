const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");
const videoPlayer = document.getElementById("videoPlayer");

// 描画座標を保存する配列
let points = [];

// --- 動画リスト ---
const videoList = ["output_with_sound_A_1_1.mp4", "output_with_sound_A_1_2.mp4", "output_with_sound_A_2_1.mp4", "output_with_sound_A_2_2.mp4"];

// --- シャッフル関数 ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const randomizedVideos = shuffle([...videoList]);
let currentIndex = 0;

// --- 背景画像読み込み ---
const img = new Image();
img.src = "stage.png";
img.onload = () => {
  loadNextVideo(); // 最初の動画を読み込む
  initDrawing();
};

// --- 描画処理 ---
function initDrawing() {
  let drawing = false;

  canvas.addEventListener("mousedown", e => { drawing = true; draw(e); });
  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mousemove", e => { if (drawing) draw(e); });
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

// --- 次の動画読み込み ---
function loadNextVideo() {
  if (currentIndex >= randomizedVideos.length) {
    status.textContent = "全ての動画が終了しました。";
    canvas.style.pointerEvents = "none";
    videoPlayer.style.display = "none";
    return;
  }

  const videoSrc = "videos/" + randomizedVideos[currentIndex];
  videoPlayer.src = videoSrc;
  videoPlayer.load();

  // canvasリセット
  points = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  status.textContent = `動画 ${currentIndex + 1} / ${randomizedVideos.length}`;

  currentIndex++;
}

// --- 保存ボタン ---
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (points.length === 0) {
    status.textContent = "描画がありません。";
    return;
  }

  status.textContent = "保存中…";

  const participantId = crypto.randomUUID();
  const videoName = randomizedVideos[currentIndex - 1].replace(".mp4", "");
  const filename = `${participantId}_${videoName}.json`;

  try {
    const res = await fetch("/.netlify/functions/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, points })
    });

    if (res.ok) {
      status.textContent = "保存完了！次の動画へ…";
      loadNextVideo();
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
