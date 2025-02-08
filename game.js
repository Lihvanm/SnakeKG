const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 71; // Размер клетки
const colors = ["red", "green", "blue", "yellow"];
let snake = [];
let player = { x: canvas.width / 2, y: canvas.height / 2 };
let bullets = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let isLoggedIn = false;

// Переменные для управления выстрелом
let isAiming = false;
let aimDirection = { x: 0, y: 0 };
let currentBulletColor = "red";

// Инициализация игры
function initGame() {
  snake = [];
  generateSnakePath();
  bullets = [];
  score = 0;
  isGameOver = false;
  currentSegmentIndex = 0;
  lastSegmentTime = Date.now();
}

// Генерация пути змейки
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = 0;

function generateSnakePath() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let radius = Math.min(canvas.width, canvas.height) / 2 - gridSize;
  let segmentsPerCircle = [9, 8, 8, 7, 6, 6, 5];

  for (let i = 0; i < segmentsPerCircle.length; i++) {
    const segments = segmentsPerCircle[i];
    const angleStep = (2 * Math.PI) / segments;
    for (let j = 0; j < segments; j++) {
      const angle = j * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      snakePath.push({ x, y });
    }
    radius -= gridSize;
  }

  for (let i = 0; i < 5; i++) {
    const x = centerX + (radius - i * gridSize) * Math.cos(0);
    const y = centerY + (radius - i * gridSize) * Math.sin(0);
    snakePath.push({ x, y });
  }
}

// Движение змеи
function moveSnake() {
  const currentTime = Date.now();
  if (currentTime - lastSegmentTime >= 1000 && currentSegmentIndex < snakePath.length) {
    const newSegment = { ...snakePath[currentSegmentIndex], color: colors[Math.floor(Math.random() * colors.length)] };
    snake.unshift(newSegment);
    currentSegmentIndex++;
    lastSegmentTime = currentTime;
  }

  if (currentSegmentIndex >= snakePath.length) {
    isGameOver = true;
    showPostGameOptions();
  }
}

// Отрисовка змеи
function drawSnake() {
  snake.forEach(segment => {
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, gridSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.closePath();
  });
}

// Отрисовка игрока
function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, gridSize, gridSize);
}

// Отрисовка направления выстрела
function drawAimLine() {
  if (isAiming) {
    ctx.strokeStyle = currentBulletColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x + gridSize / 2, player.y + gridSize / 2);
    ctx.lineTo(
      player.x + gridSize / 2 + aimDirection.x * 100,
      player.y + gridSize / 2 + aimDirection.y * 100
    );
    ctx.stroke();
  }
}

// Обновление игры
function update() {
  if (!isLoggedIn || isGameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  moveSnake();
  drawSnake();
  drawPlayer();
  drawBullets();
  drawAimLine();
  requestAnimationFrame(update);
}

// Управление мышью или сенсором
canvas.addEventListener("mousedown", () => isAiming = true);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);

function handleMouseMove(event) {
  if (isAiming) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const dx = mouseX - (player.x + gridSize / 2);
    const dy = mouseY - (player.y + gridSize / 2);
    const length = Math.sqrt(dx * dx + dy * dy);
    aimDirection = { x: dx / length, y: dy / length };
  }
}

function handleMouseUp() {
  const currentTime = Date.now();
  if (isAiming && currentTime - lastShotTime >= 500) {
    shootBullet(aimDirection);
    isAiming = false;
    lastShotTime = currentTime;
  }
}

// Показать пост-игровые опции
function showPostGameOptions() {
  document.getElementById("postGameOptions").style.display = "flex";
}
