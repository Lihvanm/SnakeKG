const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Основные настройки
const GRID_SIZE = 71;
const COLORS = ['red', 'green', 'blue', 'yellow'];
let snake = [];
let bullets = [];
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
  generateSnakePath();
}

// Генерация пути змейки
function generateSnakePath() {
  const centerX = canvas.width/2;
  const centerY = canvas.height/2;
  let radius = Math.min(canvas.width, canvas.height)/2 - GRID_SIZE;
  const segments = [9, 8, 8, 7, 6, 6, 5];

  snake = [];
  segments.forEach((count, i) => {
    const angleStep = (Math.PI*2)/count;
    for(let j = 0; j < count; j++) {
      const angle = angleStep * j;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      snake.push({
        x: x,
        y: y,
        color: COLORS[Math.floor(Math.random()*COLORS.length)]
      });
    }
    radius -= GRID_SIZE;
  });
}

// Основной игровой цикл
function gameLoop() {
  if(!isLoggedIn || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Отрисовка элементов
  drawSnake();
  drawBullets();
  drawAim();
  
  // Обновление позиций
  updateBullets();
  checkCollisions();
  
  requestAnimationFrame(gameLoop);
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

// Отрисовка пуль
function drawBullets() {
  bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI*2);
    ctx.fill();
  });
}

// Логика стрельбы
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
  
  aimDirection = {
    x: dx/length,
    y: dy/length
  };
}

function shoot() {
  if(!isAiming) return;
  
  bullets.push({
    x: canvas.width/2,
    y: canvas.height/2,
    dx: aimDirection.x * 8,
    dy: aimDirection.y * 8,
    color: currentBulletColor
  });
  
  isAiming = false;
}

// Обновление позиций пуль
function updateBullets() {
  bullets.forEach(bullet => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
  });
}

// Проверка столкновений
function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    snake.forEach((segment, sIndex) => {
      const dx = bullet.x - segment.x;
      const dy = bullet.y - segment.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      if(distance < GRID_SIZE) {
        handleCollision(bullet, segment, bIndex, sIndex);
      }
    });
  });
}

function handleCollision(bullet, segment, bIndex, sIndex) {
  if(bullet.color === segment.color) {
    snake.splice(sIndex, 1);
    score += 100;
    bullets.splice(bIndex, 1);
    
    // Восстановление пути
    if(snake.length === 0 && sIndex > 0) {
      snake.unshift(snake[sIndex-1]);
    }
  }
}

// Отрисовка прицела
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

// Система авторизации
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

// Запуск игры
document.getElementById('startGameButton').addEventListener('click', () => {
  initGame();
  canvas.style.display = 'block';
  gameLoop();
});
