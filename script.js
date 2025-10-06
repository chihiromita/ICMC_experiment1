const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

// 背景画像を読み込み
const img = new Image();
img.src = "stage.png"; // ファイルパスを確認
img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  initDrawing(); // 画像読み込み後に描画イベントをセット
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
}
