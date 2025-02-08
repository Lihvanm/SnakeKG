const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Конфигурация игры
const GRID_SIZE = 71;
const COLORS = ['red', 'green', 'blue', 'yellow'];
const SNAKE_SPEED = 800; // ms между сегментами
const BULLET_SPEED = 8;

// Состояние игры
let snake = [];
let bullets = [];
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = Date.now();
let score = 0;
let highScore = 0;
let isGameOver = false;
let isLoggedIn = false;
let currentBulletColor = 'red';
let isAiming = false;
let aimDirection = { x: 0, y: 0 };

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
  snakePath = [];
  const centerX = canvas.width/2;
  const centerY = canvas.height/2;
  let radius = Math.min(canvas.width, canvas.height)/2 - GRID_SIZE;
  const segments = [9, 8, 8, 7, 6, 6, 5];

  segments.forEach((count, i) => {
    const angleStep = (Math.PI*2)/count;
    for(let j = 0; j < count; j++) {
      const angle = angleStep * j;
      snakePath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    radius -= GRID_SIZE;
  });
}

// Движение змейки
function updateSnake() {
  const now = Date.now();
  
  if(now - lastSegmentTime > SNAKE_SPEED && currentSegmentIndex < snakePath.length) {
    snake.unshift({
      x: snakePath[currentSegmentIndex].x,
      y: snakePath[currentSegmentIndex].y,
      color: COLORS[Math.floor(Math.random()*COLORS.length)]
    });
    currentSegmentIndex++;
    lastSegmentTime = now;
  }
  
  // Ограничение длины змейки
  if(snake.length > 50) snake.pop();
}

// Отрисовка змейки
function drawSnake() {
  snake.forEach(segment => {
    ctx.fillStyle = segment.color;
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, GRID_SIZE/2, 0, Math.PI*2);
    ctx.fill();
  });
}

// Логика пуль
function updateBullets() {
  bullets.forEach(bullet => {
    bullet.x += bullet.dx * BULLET_SPEED;
    bullet.y += bullet.dy * BULLET_SPEED;
  });
}

// Отрисовка пуль
function drawBullets() {
  bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI*2);
    ctx.fill();
  });
}

// Проверка столкновений
function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    snake.forEach((segment, sIndex) => {
      const dx = bullet.x - segment.x;
      const dy = bullet.y - segment.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      if(distance < GRID_SIZE && bullet.color === segment.color) {
        snake.splice(sIndex, 1);
        score += 100;
        bullets.splice(bIndex, 1);
        currentSegmentIndex = Math.max(0, currentSegmentIndex - 1);
      }
    });
  });
}

// Система прицеливания
function drawAim() {
  if(!isAiming) return;
  
  ctx.strokeStyle = currentBulletColor;
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, canvas.height/2);
  ctx.lineTo(
    canvas.width/2 + aimDirection.x * 100,
    canvas.height/2 + aimDirection.y * 100
  );
  ctx.stroke();
}

// Управление
canvas.addEventListener('mousedown', startAim);
canvas.addEventListener('mousemove', updateAim);
canvas.addEventListener('mouseup', shoot);

function startAim(e) {
  isAiming = true;
  updateAim(e);
}

function updateAim(e) {
  if(!isAiming) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const dx = mouseX - canvas.width/2;
  const dy = mouseY - canvas.height/2;
  const length = Math.sqrt(dx*dx + dy*dy);
  
  aimDirection.x = dx/length;
  aimDirection.y = dy/length;
}

function shoot() {
  if(!isAiming) return;
  
  bullets.push({
    x: canvas.width/2,
    y: canvas.height/2,
    dx: aimDirection.x,
    dy: aimDirection.y,
    color: currentBulletColor
  });
  
  isAiming = false;
}

// Игровой цикл
function gameLoop() {
  if(!isLoggedIn || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  updateSnake();
  drawSnake();
  updateBullets();
  checkCollisions();
  drawAim();
  
  requestAnimationFrame(gameLoop);
}

// Авторизация
document.getElementById('loginButton').addEventListener('click', () => {
  const nickname = document.getElementById('nicknameInput').value;
  const alliance = document.getElementById('allianceInput').value;
  const server = document.getElementById('serverInput').value;
  
  if(nickname && alliance && server) {
    isLoggedIn = true;
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('factionSelection').style.display = 'flex';
  }
});

// Выбор фракции
document.querySelectorAll('#factionSelection button').forEach(btn => {
  btn.addEventListener('click', () => {
    currentBulletColor = btn.dataset.faction;
    document.getElementById('factionSelection').style.display = 'none';
    document.getElementById('gameControls').style.display = 'block';
  });
});

// Старт игры
document.getElementById('startGameButton').addEventListener('click', () => {
  initGame();
  canvas.style.display = 'block';
  gameLoop();
});
