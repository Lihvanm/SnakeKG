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
  initGame();
  update();
  document.getElementById("startGameButton").style.display = "none";
});

// Инициализация игры
function initGame() {
  snake = [{ x: 20, y: 0, color: colors[Math.floor(Math.random() * colors.length)] }]; // Начальная позиция змеи
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
function moveSnake() {
  const head = { x: snake[0].x, y: snake[0].y };
  const radius = Math.sqrt((head.x - canvas.width / 2) ** 2 + (head.y - canvas.height / 2) ** 2);

  // Проверка на приближение к центру
  if (radius <= gridSize) {
    isGameOver = true;
    alert("Game Over! Your score: " + score);
    document.getElementById("startGameButton").style.display = "block";
    saveStats();
    return;
  }

  // Вычисление нового направления
  const angle = Math.atan2(canvas.height / 2 - head.y, canvas.width / 2 - head.x);
  head.x += Math.cos(angle) * gridSize / 15; // Уменьшаем скорость в 15 раз
  head.y += Math.sin(angle) * gridSize / 15;

  // Добавление новой головы
  snake.unshift({ ...head, color: colors[Math.floor(Math.random() * colors.length)] });

  // Автоматический рост каждые 3 секунды
  setTimeout(() => snake.push({ x: -gridSize, y: -gridSize }), 3000);
}

// Отрисовка игрока
function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, gridSize, gridSize);
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

// Текущий цвет снаряда
let currentBulletColor = colors[Math.floor(Math.random() * colors.length)];

// Обновление игры
function update() {
  if (!isLoggedIn || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  moveSnake();
  drawSnake();
  drawPlayer();
  drawBullets();
  drawStats();

  requestAnimationFrame(update);
}

// Управление
let lastShotTime = 0;
document.addEventListener("keydown", event => {
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };

  const currentTime = Date.now();
  if (directions[event.key] && currentTime - lastShotTime > 500) {
    shootBullet(directions[event.key]);
    lastShotTime = currentTime;
  }
});

// Сенсорное управление
canvas.addEventListener("touchstart", event => {
  const touch = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  const direction = {
    x: touch.clientX - rect.left - player.x,
    y: touch.clientY - rect.top - player.y
  };
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  direction.x /= length;
  direction.y /= length;

  const currentTime = Date.now();
  if (currentTime - lastShotTime > 500) {
    shootBullet(direction);
    lastShotTime = currentTime;
  }
});
