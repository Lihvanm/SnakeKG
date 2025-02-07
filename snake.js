const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20; // Размер одной клетки
let snake = [{ x: 10, y: 10 }]; // Начальная позиция змейки
let food = { x: 5, y: 5 }; // Позиция еды
let direction = { x: 0, y: 0 }; // Направление движения
let score = 0;

// Генерация случайной позиции для еды
function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / box)),
    y: Math.floor(Math.random() * (canvas.height / box)),
  };
}

// Отрисовка змейки и еды
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Отрисовка змейки
  ctx.fillStyle = "green";
  snake.forEach(segment => ctx.fillRect(segment.x * box, segment.y * box, box, box));

  // Отрисовка еды
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * box, food.y * box, box, box);

  // Отрисовка счёта
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
}

// Обновление состояния игры
function update() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Проверка столкновений
  if (
    head.x < 0 || head.x >= canvas.width / box ||
    head.y < 0 || head.y >= canvas.height / box ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    alert("Game Over!");
    resetGame();
    return;
  }

  // Добавление новой головы
  snake.unshift(head);

  // Проверка, съела ли змейка еду
  if (head.x === food.x && head.y === food.y) {
    score++;
    generateFood();
  } else {
    snake.pop(); // Убираем последний сегмент, если еда не съедена
  }
}

// Сброс игры
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  generateFood();
}

// Управление змейкой
document.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});

// Запуск игры
function gameLoop() {
  update();
  draw();
}
setInterval(gameLoop, 150); // Обновление каждые 150 мс
generateFood();