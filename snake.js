const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

// Отрисовка змейки
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, gridSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.closePath();
  });
}

// Отрисовка игрока (смайлик в центре)
function drawPlayer() {
  ctx.font = `${gridSize}px Arial`;
  ctx.fillStyle = "yellow";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("😎", player.x, player.y); // Смайлик
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

// Запуск игры
document.getElementById("startGameButton").addEventListener("click", () => {
  canvas.style.display = "block";
  initSnake();
  update();
  document.getElementById("startGameButton").style.display = "none";
  document.getElementById("sendResultButton").style.display = "block";
});

// Обновление игры
function update() {
  if (!isLoggedIn || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  moveSnake();
  drawSnake();
  drawPlayer();
  drawBullets();
  drawAimLine();
  updateStatsUI(
    document.getElementById("nicknameInput").value.trim(),
    document.getElementById("allianceInput").value.trim(),
    document.getElementById("serverInput").value.trim()
  );

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
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    aimDirection = { x: dx / length, y: dy / length };
  }
});
canvas.addEventListener("mouseup", () => {
  const currentTime = Date.now();
  if (isAiming && currentTime - lastShotTime >= 500) {
    shootBullet(aimDirection);
    isAiming = false;
    lastShotTime = currentTime;
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
    const dx = touchX - player.x;
    const dy = touchY - player.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    aimDirection = { x: dx / length, y: dy / length };
  }
});
canvas.addEventListener("touchend", () => {
  const currentTime = Date.now();
  if (isAiming && currentTime - lastShotTime >= 500) {
    shootBullet(aimDirection);
    isAiming = false;
    lastShotTime = currentTime;
  }
});

// Кнопка "Отправить результат"
document.getElementById("sendResultButton").addEventListener("click", () => {
  const nickname = document.getElementById("nicknameInput").value.trim();
  const alliance = document.getElementById("allianceInput").value.trim();
  const serverNumber = document.getElementById("serverInput").value.trim();
  sendTelegramMessage(nickname, alliance, serverNumber, score);
});
