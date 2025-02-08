const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 20; // Размер клетки
let snake = [];
let food = null;
let direction = { x: -1, y: 0 }; // Начальное направление (влево)
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
  food = getRandomFoodPosition();
  direction = { x: -1, y: 0 }; // Начальное направление (влево)
  score = 0;
  isGameOver = false;
}

// Генерация случайной позиции для еды
function getRandomFoodPosition() {
  return {
    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
  };
}

// Отрисовка змеи
function drawSnake() {
  ctx.fillStyle = "lime";
  snake.forEach(segment => ctx.fillRect(segment.x, segment.y, gridSize, gridSize));
}

// Отрисовка еды
function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);
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

  // Проверка на поедание еды
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = getRandomFoodPosition();
  } else {
    snake.pop(); // Убираем хвост, если еда не съедена
  }
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
  drawFood();
  drawStats();

  requestAnimationFrame(update);
}
