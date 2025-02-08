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
  snake = [{ x: 20, y: 0 }]; // Начальная позиция змеи (правый верхний угол)
  direction = { x: -1, y: 0 }; // Начальное направление (влево)
  bullets = [];
  score = 0;
  isGameOver = false;
}

// Отрисовка змеи
function drawSnake() {
  ctx.fillStyle = "lime";
  snake.forEach(segment => ctx.fillRect(segment.x, segment.y, gridSize, gridSize));
}

// Движение змеи
function moveSnake() {
  const head = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };

  // Проверка столкновений
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    isGameOver = true;
    alert("Game Over! Your score: " + score);
    document.getElementById("startGameButton").style.display = "block";
    saveStats();
    return;
  }

  // Добавление новой головы
  snake.unshift(head);

  // Автоматический рост каждые 3 секунды
  setTimeout(() => snake.push({ x: -gridSize, y: -gridSize }), 3000);
}

// Обновление направления змеи
function updateDirection() {
  const head = snake[0];
  const nextX = head.x + direction.x * gridSize;
  const nextY = head.y + direction.y * gridSize;

  // Поворот при столкновении со стеной или хвостом
  if (nextX < 0 || nextX >= canvas.width || nextY < 0 || nextY >= canvas.height) {
    if (direction.x === -1) direction = { x: 0, y: 1 }; // Вниз
    else if (direction.y === 1) direction = { x: 1, y: 0 }; // Вправо
    else if (direction.x === 1) direction = { x: 0, y: -1 }; // Вверх
    else if (direction.y === -1) direction = { x: -1, y: 0 }; // Влево
  }
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
    color: colors[Math.floor(Math.random() * colors.length)]
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
        snake.splice(segIndex, 1); // Уничтожение фрагмента
        bullets.splice(index, 1); // Удаление снаряда
        score++;
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

  updateDirection();
  moveSnake();
  drawSnake();
  drawPlayer();
  drawBullets();
  drawStats();

  requestAnimationFrame(update);
}

// Управление
document.addEventListener("keydown", event => {
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };

  if (directions[event.key]) {
    shootBullet(directions[event.key]);
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
  shootBullet(direction);
});
