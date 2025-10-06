// Canvas setup
const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

// 背景画像を読み込み
const img = new Image();
img.src = "stage.png";
img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

// 描画機能
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

function draw(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.fillStyle = "rgba(255,0,0,0.7)";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

// 保存
document.getElementById("saveBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `drawing_${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();

  document.getElementById("status").textContent = "描画画像を保存しました。";
});
