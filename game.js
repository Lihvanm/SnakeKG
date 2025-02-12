const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 71; // Размер ячейки
const colors = ["red", "green", "blue", "yellow"];
let snake = [];
let player = { x: canvas.width / 2, y: canvas.height / 2 };
let bullets = [];
let score = 0;
let isGameOver = false;

// Авторизация
document.getElementById("loginButton").addEventListener("click", () => {
  const nickname = document.getElementById("nicknameInput").value.trim();
  if (nickname) {
    alert(`Добро пожаловать, ${nickname}!`);
    document.getElementById("authForm").style.display = "none";
    document.getElementById("startGameButton").style.display = "block";
  } else {
    alert("Пожалуйста, заполните все поля.");
  }
});

// Начало игры
document.getElementById("startGameButton").addEventListener("click", () => {
  canvas.style.display = "block";
  initGame();
  update();
  document.getElementById("startGameButton").style.display = "none";
});

// Инициализация игры
function initGame() {
  snake = [];
  generateSnakePath();
  bullets = [];
  score = 0;
  isGameOver = false;
}

// Генерация пути змейки
let snakePath = [];
let currentSegmentIndex = 0;

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
}

// Движение змеи
function moveSnake() {
  if (currentSegmentIndex < snakePath.length) {
    snake.unshift({ ...snakePath[currentSegmentIndex], color: colors[Math.floor(Math.random() * colors.length)] });
    currentSegmentIndex++;
  } else {
    isGameOver = true;
    alert("Game Over! Your score: " + score);
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

// Обновление игры
function update() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  moveSnake();
  drawSnake();
  drawPlayer();
  requestAnimationFrame(update);
}
