// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 71;
const canvasSize = 640;
const colors = ["red", "green", "blue", "yellow"];
let snake = [];
let player = { x: canvas.width / 2, y: canvas.height / 2 };
let bullets = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let isLoggedIn = false;
let currentBulletColor = "red";
let isAiming = false;
let aimDirection = { x: 0, y: 0 };

// Логика змейки
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = 0;

// Telegram
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
    document.getElementById("factionSelection").style.display = "flex";
    loadStats();
    updateStatsUI(nickname, alliance, serverNumber);
  } else {
    alert("Пожалуйста, заполните все поля.");
  }
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    const inputs = [
      document.getElementById("nicknameInput"),
      document.getElementById("allianceInput"),
      document.getElementById("serverInput")
    ];
    const currentIndex = inputs.indexOf(event.target);
    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    } else {
      handleLogin();
    }
  }
}

// Выбор фракции
document.querySelectorAll("#factionSelection button").forEach(button => {
  button.addEventListener("click", () => {
    const faction = button.getAttribute("data-faction");
    currentBulletColor = {
      "fire": "red",
      "ice": "blue",
      "archer": "yellow",
      "goblin": "green"
    }[faction];
    
    document.getElementById("factionSelection").style.display = "none";
    document.getElementById("startGameButton").style.display = "block";
  });
});

// Начало игры
document.getElementById("startGameButton").addEventListener("click", () => {
  document.getElementById("videoContainer").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  initGame();
  update();
});

// Логика змейки
function generateSnakePath() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let radius = Math.min(canvas.width, canvas.height) / 2 - gridSize;
  let segmentsPerCircle = [9, 8, 8, 7, 6, 6, 5];

  for (let i = 0; i < segmentsPerCircle.length; i++) {
    const segments = segmentsPerCircle[i];
    const angleStep = (2 * Math.PI) / segments;

    for (let j = 0; j < segments; j++) {
      const angle = j * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      snakePath.push({ x: x, y: y });
    }
    radius -= gridSize;
  }

  for (let i = 0; i < 5; i++) {
    const x = centerX + (radius - i * gridSize) * Math.cos(0);
    const y = centerY + (radius - i * gridSize) * Math.sin(0);
    snakePath.push({ x: x, y: y });
  }
}

function moveSnake() {
  const currentTime = Date.now();
  if (currentTime - lastSegmentTime >= 1000 && currentSegmentIndex < snakePath.length) {
    const newSegment = { ...snakePath[currentSegmentIndex], color: colors[Math.floor(Math.random() * colors.length)] };
    snake.unshift(newSegment);
    currentSegmentIndex++;
    lastSegmentTime = currentTime;
  }

  if (currentSegmentIndex >= snakePath.length) {
    isGameOver = true;
    showPostGameOptions();
  }
}

// Остальные функции игры
function initGame() {
  snake = [];
  generateSnakePath();
  bullets = [];
  score = 0;
  isGameOver = false;
  currentSegmentIndex = 0;
  lastSegmentTime = Date.now();
}

function update() {
  if (!isLoggedIn || isGameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  moveSnake();
  drawSnake();
  handleCollision();
  requestAnimationFrame(update);
}

// Добавьте остальные функции (drawSnake, handleCollision и т.д.) здесь...

// Telegram
async function sendTelegramMessage(nickname, alliance, serverNumber, bestScore) {
  const message = `🏆 Результаты игры:\nНик: ${nickname}\nАльянс: ${alliance}\nСервер: №${serverNumber}\nНаилучший счет: ${bestScore}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

  try {
    await fetch(url);
    alert("Результат отправлен в группу!");
  } catch (error) {
    alert("Ошибка при отправке результата.");
  }
}
