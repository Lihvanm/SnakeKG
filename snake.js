const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 20; // Размер клетки
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
let currentBulletColor = colors[Math.floor(Math.random() * colors.length)];

// Авторизация
document.getElementById("loginButton").addEventListener("click", () => {
  const alliance = document.getElementById("allianceInput").value;
  const serverNumber = document.getElementById("serverInput").value;
  if (alliance && serverNumber) {
    isLoggedIn = true;
    alert(`Добро пожаловать, ${alliance}! Сервер №${serverNumber}`);
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("startGameButton").style.display = "block";
    loadStats();
  } else {
    alert("Пожалуйста, заполните все поля.");
  }
});

// Начало игры
document.getElementById("startGameButton").addEventListener("click", () => {
  document.getElementById("gifContainer").style.display = "none"; // Скрываем GIF
  canvas.style.display = "block"; // Показываем холст
  initGame();
  update();
  document.getElementById("startGameButton").style.display = "none";
});

// Инициализация игры
function initGame() {
  snake = [{ x: canvas.width - gridSize, y: 0, color: colors[Math.floor(Math.random() * colors.length)] }]; // Начальная позиция змеи
  bullets = [];
  score = 0;
  isGameOver = false;
}

// Отрисовка змеи
function drawSnake() {
  snake.forEach(segment => {
    ctx.fillStyle = segment.color;
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });
}

// Движение змеи
let angle = 0; // Угол для движения по кругу
function moveSnake() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.max(canvas.width, canvas.height) / 2 - gridSize; // Максимальный радиус

  // Вычисляем новую позицию головы змеи
  const headX = centerX + radius * Math.cos(angle);
  const headY = centerY + radius * Math.sin(angle);

  // Добавляем новую голову
  snake.unshift({ x: headX, y: headY, color: colors[Math.floor(Math.random() * colors.length)] });

  // Уменьшаем угол для движения по спирали
  angle += 0.01; // Угол увеличивается медленно

  // Автоматический рост каждые 3 секунды
  setTimeout(() => snake.push({ x: -gridSize, y: -gridSize }), 3000);
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
          segment.color = bullet.color; // Изменение цвета фрагмента
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
  if (isAiming) {
    shootBullet(aimDirection);
    isAiming = false;
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
  if (isAiming) {
    shootBullet(aimDirection);
    isAiming = false;
  }
});
