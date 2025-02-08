// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 71;
const colors = ["red", "green", "blue", "yellow"];
let snake = [];
let bullets = [];
let score = 0;
let isGameOver = false;
let isLoggedIn = false;
let currentBulletColor = "red";
let isAiming = false;
let aimDirection = { x: 0, y: 0 };
let snakePath = [];
let currentSegmentIndex = 0;

// Авторизация
document.getElementById("loginButton").addEventListener("click", handleLogin);

function handleLogin() {
  const nickname = document.getElementById("nicknameInput").value.trim();
  const alliance = document.getElementById("allianceInput").value.trim();
  const server = document.getElementById("serverInput").value.trim();

  if (nickname && alliance && server) {
    isLoggedIn = true;
    document.getElementById("authForm").style.display = "none";
    document.getElementById("factionSelection").style.display = "flex";
  } else {
    alert("Заполните все поля!");
  }
}

// Выбор фракции
document.querySelectorAll("#factionSelection button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentBulletColor = btn.dataset.faction;
    document.getElementById("factionSelection").style.display = "none";
    document.getElementById("startGameButton").style.display = "block";
  });
});

// Запуск игры
document.getElementById("startGameButton").addEventListener("click", () => {
  document.getElementById("videoContainer").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  initGame();
  update();
});

// Инициализация игры
function initGame() {
  snake = [];
  bullets = [];
  score = 0;
  isGameOver = false;
  currentSegmentIndex = 0;
  generateSnakePath();
}

// Генерация пути змейки
function generateSnakePath() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let radius = Math.min(canvas.width, canvas.height) / 2 - gridSize;
  const segmentsPerCircle = [9, 8, 8, 7, 6, 6, 5];

  segmentsPerCircle.forEach((segments, i) => {
    const angleStep = (2 * Math.PI) / segments;
    for (let j = 0; j < segments; j++) {
      const angle = j * angleStep;
      snakePath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    radius -= gridSize;
  });
}

// Основной игровой цикл
function update() {
  if (!isLoggedIn || isGameOver) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  moveSnake();
  moveBullets();
  checkCollisions();
  drawGame();
  
  requestAnimationFrame(update);
}

// Движение змейки
function moveSnake() {
  if (currentSegmentIndex < snakePath.length) {
    snake.unshift({
      ...snakePath[currentSegmentIndex],
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    currentSegmentIndex++;
  } else {
    isGameOver = true;
  }
}

// Движение пуль
function moveBullets() {
  bullets.forEach(bullet => {
    bullet.x += bullet.dx * 5;
    bullet.y += bullet.dy * 5;
  });
}

// Проверка столкновений
function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    snake.forEach((segment, sIndex) => {
      const dx = bullet.x - segment.x;
      const dy = bullet.y - segment.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < gridSize) {
        if (bullet.color === segment.color) {
          // Уничтожение сегмента
          snake.splice(sIndex, 1);
          score += 100;
          
          // Восстановление пути
          if (snake.length > 0) {
            snake.unshift(snakePath[currentSegmentIndex - 1]);
            currentSegmentIndex--;
          }
        }
        bullets.splice(bIndex, 1);
      }
    });
  });
}

// Отрисовка игры
function drawGame() {
  // Змейка
  snake.forEach(segment => {
    ctx.fillStyle = segment.color;
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });

  // Пули
  bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Прицел
  if (isAiming) {
    ctx.strokeStyle = currentBulletColor;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(
      canvas.width/2 + aimDirection.x * 100,
      canvas.height/2 + aimDirection.y * 100
    );
    ctx.stroke();
  }
}

// Обработчики стрельбы
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  aimDirection = {
    x: mouseX - canvas.width/2,
    y: mouseY - canvas.height/2
  };
  const length = Math.sqrt(aimDirection.x**2 + aimDirection.y**2);
  aimDirection.x /= length;
  aimDirection.y /= length;
});

canvas.addEventListener("mousedown", () => isAiming = true);
canvas.addEventListener("mouseup", () => {
  if (!isAiming) return;
  
  bullets.push({
    x: canvas.width/2,
    y: canvas.height/2,
    dx: aimDirection.x,
    dy: aimDirection.y,
    color: currentBulletColor
  });
  
  isAiming = false;
});
