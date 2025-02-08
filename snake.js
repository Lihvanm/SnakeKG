const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 20; // Размер клетки
const colors = ["red", "green", "blue", "yellow"]; // Цвета фрагментов змеи
let snake = [];
let player = { x: canvas.width / 2, y: canvas.height / 2 }; // Игрок в центре
let bullets = [];
let score = 0;
let level = 1;
let isGameOver = false;

// Инициализация змеи
function initSnake() {
  const radius = Math.min(canvas.width, canvas.height) / 2 - gridSize;
  const segments = 20; // Количество фрагментов змеи
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = canvas.width / 2 + radius * Math.cos(angle);
    const y = canvas.height / 2 + radius * Math.sin(angle);
    snake.push({ x, y, color: colors[i % colors.length] });
  }
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
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  snake.forEach(segment => {
    const dx = centerX - segment.x;
    const dy = centerY - segment.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    segment.x += (dx / distance) * level; // Скорость зависит от уровня
    segment.y += (dy / distance) * level;
  });
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
        if (bullet.color === segment.color) {
          snake.splice(segIndex, 1); // Уничтожение фрагмента
          bullets.splice(index, 1); // Удаление снаряда
          score++;
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
  drawBullets();

  // Проверка проигрыша
  if (snake.some(segment => segment.x === player.x && segment.y === player.y)) {
    isGameOver = true;
    alert("Game Over! Your score: " + score);
  }

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

// Инициализация игры
initSnake();
update();
