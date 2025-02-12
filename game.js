const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

// Переменные для управления выстрелом
let isAiming = false; // Флаг для наведения цели
let aimDirection = { x: 0, y: 0 }; // Направление прицеливания
let currentBulletColor = "red"; // Цвет снаряда по умолчанию

// Выбор фракции
document.querySelectorAll(".faction-selection button").forEach(button => {
  button.addEventListener("click", () => {
    const faction = button.getAttribute("data-faction");
    switch (faction) {
      case "fire":
        currentBulletColor = "red";
        break;
      case "ice":
        currentBulletColor = "blue";
        break;
      case "archer":
        currentBulletColor = "yellow";
        break;
      case "goblin":
        currentBulletColor = "green";
        break;
    }
    document.getElementById("factionSelection").style.display = "none";
    document.getElementById("gameButtons").style.display = "block";
  });
});

// Начало игры
document.getElementById("startGameButton").addEventListener("click", () => {
  canvas.style.display = "block"; // Показываем холст
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
  currentSegmentIndex = 0;
  lastSegmentTime = Date.now();
}

// Генерация пути змейки
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = 0;

function generateSnakePath() {
  let x = canvasSize - gridSize / 2; // Начальная точка (правый верхний угол)
  let y = gridSize / 2;
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
  if (currentTime - lastSegmentTime >= 1000 && currentSegmentIndex < snakePath.length) {
    const newSegment = { ...snakePath[currentSegmentIndex], color: colors[Math.floor(Math.random() * colors.length)] };
    snake.unshift(newSegment);
    currentSegmentIndex++;
    lastSegmentTime = currentTime;
  }
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

// Стрельба
let lastShotTime = 0; // Время последнего выстрела

function shootBullet(direction) {
  const bullet = {
    x: player.x,
    y: player.y,
    dx: direction.x,
    dy: direction.y,
    color: currentBulletColor
  };
  bullets.push(bullet);
}

// Отрисовка снарядов
function drawBullets() {
  bullets.forEach((bullet, index) => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, gridSize / 2, gridSize / 2);
    // Перемещение снаряда
    bullet.x += bullet.dx * 5;
    bullet.y += bullet.dy * 5;
    // Проверка столкновений
    snake.forEach((segment, segIndex) => {
      if (
        bullet.x < segment.x + gridSize &&
        bullet.x + gridSize / 2 > segment.x &&
        bullet.y < segment.y + gridSize &&
        bullet.y + gridSize / 2 > segment.y
      ) {
        if (bullet.color === segment.color) {
          snake.splice(segIndex, 1); // Уничтожение фрагмента
          bullets.splice(index, 1); // Удаление снаряда
          score++;
        } else {
          segment.color = getWeakColor(segment.color); // Изменение цвета фрагмента
          bullets.splice(index, 1); // Удаление снаряда
        }
      }
    });
    // Удаление снаряда за пределами экрана
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }
  });
}

// Получение слабого цвета
function getWeakColor(color) {
  const colorOrder = ["red", "yellow", "green", "blue"];
  const currentIndex = colorOrder.indexOf(color);
  return colorOrder[(currentIndex + 1) % colorOrder.length];
}

// Отрисовка статистики
function drawStats() {
  const statsDiv = document.getElementById("stats");
  statsDiv.innerHTML = `Рейтинг: ${score} | Рекорд: ${highScore}`;
}

// Сохранение статистики в localStorage
function saveStats() {
  highScore = Math.max(highScore, score);
  localStorage.setItem("highScore", highScore);
}

// Загрузка статистики из localStorage
function loadStats() {
  highScore = parseInt(localStorage.getItem("highScore")) || 0;
}

// Обновление игры
function update() {
  if (isGameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  moveSnake();
  drawSnake();
  drawPlayer();
  drawBullets();
  drawAimLine(); // Отрисовка направления выстрела
  drawStats();
  requestAnimationFrame(update);
}

// Управление мышью или сенсором
canvas.addEventListener("mousedown", (event) => {
  isAiming = true;
});
canvas.addEventListener("mousemove", (event) => {
  if (isAiming) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const dx = mouseX - (player.x + gridSize / 2);
    const dy = mouseY - (player.y + gridSize / 2);
    const length = Math.sqrt(dx * dx + dy * dy);
    aimDirection = { x: dx / length, y: dy / length };
  }
});
canvas.addEventListener("mouseup", () => {
  const currentTime = Date.now();
  if (isAiming && currentTime - lastShotTime >= 500) { // Не более 2 выстрелов в секунду
    shootBullet(aimDirection);
    isAiming = false;
    lastShotTime = currentTime;
  }
});

// Управление сенсором
canvas.addEventListener("touchstart", (event) => {
  isAiming = true;
});
canvas.addEventListener("touchmove", (event) => {
  if (isAiming) {
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    const dx = touchX - (player.x + gridSize / 2);
    const dy = touchY - (player.y + gridSize / 2);
    const length = Math.sqrt(dx * dx + dy * dy);
    aimDirection = { x: dx / length, y: dy / length };
  }
});
canvas.addEventListener("touchend", () => {
  const currentTime = Date.now();
  if (isAiming && currentTime - lastShotTime >= 500) { // Не более 2 выстрелов в секунду
    shootBullet(aimDirection);
    isAiming = false;
    lastShotTime = currentTime;
  }
});

// Показать пост-игровые опции
function showPostGameOptions() {
  document.getElementById("postGameOptions").style.display = "flex"; // Показываем кнопки "Начать заново"
  saveStats();
}

// Кнопка "Начать заново"
document.getElementById("restartGameButton").addEventListener("click", () => {
  document.getElementById("postGameOptions").style.display = "none"; // Скрываем пост-игровые опции
  initGame(); // Инициализируем игру заново
  update(); // Запускаем игровой цикл
});

// Загрузка статистики при старте
loadStats();
