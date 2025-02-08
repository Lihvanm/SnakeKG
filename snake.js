// Настройки игры
const gridSize = 71; // Размер ячейки (71 пиксель)
const canvasSize = 640; // Размер игрового поля (640x640 пикселей)
const colors = ["red", "green", "blue", "yellow"]; // Цвета фрагментов змеи
let snake = [];
let player = { x: canvas.width / 2, y: canvas.height / 2 }; // Игрок в центре
let bullets = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let isLoggedIn = false;

// Переменные для управления выстрелом
let isAiming = false; // Флаг для наведения цели
let aimDirection = { x: 0, y: 0 }; // Направление прицеливания
let currentBulletColor = "red"; // Цвет снаряда по умолчанию

// Инициализация холста
const canvas = document.getElementById("gameCanvas");
canvas.width = canvasSize;
canvas.height = canvasSize;
const ctx = canvas.getContext("2d");

// Генерация пути змейки
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = 0;

function generateSnakePath() {
  const startX = canvasSize - gridSize / 2; // Начальная точка (правый верхний угол)
  const startY = gridSize / 2;

  let x = startX;
  let y = startY;
  let direction = "left"; // Начальное направление движения
  let steps = 8; // Количество шагов в текущем направлении
  let stepCount = 0; // Счетчик шагов

  while (snakePath.length < 81) {
    snakePath.push({ x: x, y: y });

    if (direction === "left") {
      x -= gridSize;
    } else if (direction === "down") {
      y += gridSize;
    } else if (direction === "right") {
      x += gridSize;
    } else if (direction === "up") {
      y -= gridSize;
    }

    stepCount++;

    // Если достигли конца текущего направления, меняем направление
    if (stepCount === steps) {
      stepCount = 0;

      if (direction === "left") {
        direction = "down";
      } else if (direction === "down") {
        direction = "right";
        steps--; // Уменьшаем количество шагов для следующего круга
      } else if (direction === "right") {
        direction = "up";
      } else if (direction === "up") {
        direction = "left";
        steps--; // Уменьшаем количество шагов для следующего круга
      }
    }
  }
}

// Движение змеи
function moveSnake() {
  const currentTime = Date.now();

  // Добавляем новый сегмент каждую секунду
  if (currentTime - lastSegmentTime >= 1000 && currentSegmentIndex < snakePath.length) {
    const newSegment = { ...snakePath[currentSegmentIndex], color: colors[Math.floor(Math.random() * colors.length)] };
    snake.unshift(newSegment);
    currentSegmentIndex++;
    lastSegmentTime = currentTime;
  }

  // Если змея достигла конца пути
  if (currentSegmentIndex >= snakePath.length) {
    isGameOver = true;
    showPostGameOptions();
    return;
  }
}

// Отрисовка змеи
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, gridSize / 2, 0, Math.PI * 2); // Рисуем круглые сегменты
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
  drawAimLine(); // Отрисовка направления выстрела
  drawStats();

  requestAnimationFrame(update);
}

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

// Запуск игры
document.getElementById("startGameButton").addEventListener("click", () => {
  canvas.style.display = "block"; // Показываем холст
  initGame();
  update();
  document.getElementById("startGameButton").style.display = "none";
});
