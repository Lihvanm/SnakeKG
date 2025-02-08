const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Основные настройки
const GRID_SIZE = 71;
const COLORS = ["red", "green", "blue", "yellow"];
let snake = [];
let bullets = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let isLoggedIn = false;
let currentBulletColor = "red";
let isAiming = false;
let aimDirection = { x: 0, y: 0 };
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = Date.now();

// Инициализация игры
function initGame() {
  canvas.width = 640;
  canvas.height = 640;
  snake = [];
  bullets = [];
  score = 0;
  isGameOver = false;
  currentSegmentIndex = 0;
  generateSnakePath();
}

// Генерация пути змейки
function generateSnakePath() {
  snakePath = [];
  const centerX = canvas.width/2;
  const centerY = canvas.height/2;
  let radius = Math.min(canvas.width, canvas.height)/2 - GRID_SIZE;
  const segments = [9, 8, 8, 7, 6, 6, 5];

  segments.forEach((count, i) => {
    const angleStep = (Math.PI*2)/count;
    for(let j = 0; j < count; j++) {
      const angle = angleStep * j;
      snakePath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    radius -= GRID_SIZE;
  });
}

// Авторизация (исправленная версия)
function handleLogin() {
  const nickname = document.getElementById("nicknameInput").value.trim();
  const alliance = document.getElementById("allianceInput").value.trim();
  const server = document.getElementById("serverInput").value.trim();

  if (!nickname || !alliance || !server) {
    alert("Заполните все поля!");
    return;
  }

  isLoggedIn = true;
  document.getElementById("authForm").style.display = "none";
  document.getElementById("factionSelection").style.display = "flex";
  document.getElementById("videoContainer").style.display = "none";
  
  loadStats();
  updateStatsUI(nickname, alliance, server);
}

// Выбор фракции (исправленная версия)
document.querySelectorAll('#factionSelection button').forEach(btn => {
  btn.addEventListener('click', () => {
    currentBulletColor = btn.dataset.faction;
    document.getElementById("factionSelection").style.display = "none";
    document.getElementById("startGameButton").style.display = "block";
  });
});

// Основной игровой цикл
function update() {
  if (!isLoggedIn || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Движение змейки
  const now = Date.now();
  if(now - lastSegmentTime > 1000 && currentSegmentIndex < snakePath.length) {
    snake.unshift({
      ...snakePath[currentSegmentIndex],
      color: COLORS[Math.floor(Math.random()*COLORS.length)]
    });
    currentSegmentIndex++;
    lastSegmentTime = now;
  }

  // Отрисовка элементов
  drawSnake();
  drawBullets();
  drawAimLine();
  
  requestAnimationFrame(update);
}

// Отрисовка змейки
function drawSnake() {
  snake.forEach(segment => {
    ctx.fillStyle = segment.color;
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, GRID_SIZE/2, 0, Math.PI*2);
    ctx.fill();
  });
}

// Запуск игры
document.getElementById("startGameButton").addEventListener("click", () => {
  canvas.style.display = "block";
  initGame();
  update();
});

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  initGame();
  document.getElementById("videoContainer").style.display = "block";
});
