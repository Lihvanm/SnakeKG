const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Загрузка изображения змеи
const snakeImage = new Image();
snakeImage.src = "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5c/7b/2c/5c7b2cff-a59c-8c6d-db0d-688197cafaf4/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/1200x630wa.png";

// Настройки игры
let gridSize;
const colors = ["red", "green", "blue", "yellow"];
let snake = [];
let player = { x: 0, y: 0 };
let bullets = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let isLoggedIn = false;

// Управление выстрелом
let isAiming = false;
let aimDirection = { x: 0, y: 0 };
let currentBulletColor = "red";
let lastShotTime = 0;

// Telegram Bot API
const TELEGRAM_BOT_TOKEN = "7763147422:AAGPWCetxPUsAuhvCknqVFrZId_r0BPSEhE";
const TELEGRAM_CHAT_ID = "-1002382138419";

// Авторизация
document.getElementById("loginButton").addEventListener("click", handleLogin);
document.getElementById("nicknameInput").addEventListener("keydown", handleEnterKey);
document.getElementById("allianceInput").addEventListener("keydown", handleEnterKey);
document.getElementById("serverInput").addEventListener("keydown", handleEnterKey);

function handleLogin() {
  const nickname = document.getElementById("nicknameInput").value.trim();
  const alliance = document.getElementById("allianceInput").value.trim();
  const serverNumber = document.getElementById("serverInput").value.trim();

  if (nickname && alliance && serverNumber) {
    isLoggedIn = true;
    alert(`Добро пожаловать, ${nickname}! Альянс: ${alliance}, Сервер №${serverNumber}`);
    document.getElementById("authForm").style.display = "none";
    document.getElementById("gameButtons").style.display = "block";
    document.getElementById("factionSelection").style.display = "flex";
    document.getElementById("videoContainer").style.display = "none";
    loadStats();
    updateStatsUI(nickname, alliance, serverNumber);
  } else {
    alert("Пожалуйста, заполните все поля.");
  }
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    const inputs = [document.getElementById("nicknameInput"), document.getElementById("allianceInput"), document.getElementById("serverInput")];
    const currentIndex = inputs.indexOf(event.target);

    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    } else {
      handleLogin();
    }
  }
}

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
    document.getElementById("startGameButton").style.display = "block";
  });
});

// Адаптивный размер canvas
function resizeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight * 0.8);
  canvas.width = size;
  canvas.height = size;
  gridSize = canvas.width / 9; // Ширина змейки = ширина поля / 9
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  initSnake();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Инициализация при загрузке

// Инициализация змейки
let maxRadius;

function initSnake() {
  snake = [];
  maxRadius = Math.min(canvas.width, canvas.height) / 2 - gridSize;
  for (let i = 0; i < 32; i++) {
    snake.push({
      x: canvas.width / 2 + maxRadius * Math.cos((i * 10 * Math.PI) / 180),
      y: canvas.height / 2 + maxRadius * Math.sin((i * 10 * Math.PI) / 180),
      color: colors[i % colors.length],
    });
  }
}

// Движение змейки
let lastSegmentTime = 0;
let spiralStep = 0;

function moveSnake() {
  const currentTime = Date.now();

  if (currentTime - lastSegmentTime >= 1000) {
    const newSegment = {
      x: canvas.width / 2 + maxRadius * Math.cos((spiralStep * Math.PI) / 180),
      y: canvas.height / 2 + maxRadius * Math.sin((spiralStep * Math.PI) / 180),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    snake.unshift(newSegment);
    lastSegmentTime = currentTime;
  }

  for (let i = snake.length - 1; i > 0; i--) {
    snake[i].x = snake[i - 1].x;
    snake[i].y = snake[i - 1].y;
  }

  moveHead();
}

function moveHead() {
  const head = snake[0];
  const angle = (spiralStep * Math.PI) / 180;
  const radius = maxRadius * (1 - spiralStep / 360); // Уменьшаем радиус для спирали
  head.x = canvas.width / 2 + radius * Math.cos(angle);
  head.y = canvas.height / 2 + radius * Math.sin(angle);
  spiralStep += 1;
}

// Отрисовка змейки с использованием изображения
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.save();
    ctx.translate(segment.x, segment.y);
    ctx.rotate((spiralStep * Math.PI) / 180);
    ctx.drawImage(
      snakeImage,
      -gridSize / 2, -gridSize / 2,
      gridSize, gridSize
    );
    ctx.restore();
  });
}

// Отрисовка игрока (стрелок в центре)
function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.fillRect(player.x - gridSize / 2, player.y - gridSize / 2, gridSize, gridSize);
}

// Отрисовка направления выстрела (тонкая стрелка)
function drawAimLine() {
  if (isAiming) {
    ctx.strokeStyle = currentBulletColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(
      player.x + aimDirection.x * 100,
      player.y + aimDirection.y * 100
    );
    ctx.stroke();
  }
}

// Остальные функции (стрельба, управление, Telegram-интеграция и т.д.) остаются без изменений.
