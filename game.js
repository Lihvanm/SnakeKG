// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 71; // Размер ячейки (71 пиксель)
const canvasSize = 640; // Размер игрового поля (640x640 пикселей)
const colors = ["red", "green", "blue", "yellow"]; // Цвета фрагментов змеи
let snake = [];
let player = { x: canvas.width / 2, y: canvas.height / 2 }; // Игрок в центре
let bullets = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let isLoggedIn = false;

// Переменные для управления выстрелом
let isAiming = false; // Флаг для наведения цели
let aimDirection = { x: 0, y: 0 }; // Направление прицеливания
let currentBulletColor = "red"; // Цвет снаряда по умолчанию

// Telegram Bot API
const TELEGRAM_BOT_TOKEN = "7763147422:AAGPWCetxPUsAuhvCknqVFrZId_r0BPSEhE"; // Токен вашего бота
const TELEGRAM_CHAT_ID = "-1002382138419"; // ID группы Snake_KG

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
    document.getElementById("authForm").style.display = "none"; // Скрываем форму авторизации
    document.getElementById("gameButtons").style.display = "block"; // Показываем кнопки
    document.getElementById("factionSelection").style.display = "flex"; // Показываем выбор фракции
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
      inputs[currentIndex + 1].focus(); // Переходим к следующему полю
    } else {
      handleLogin(); // Если это последнее поле, выполняем вход
    }
  }
}

// Выбор фракции
document.querySelectorAll("#factionSelection button").forEach(button => {
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
    document.getElementById("factionSelection").style.display = "none";
    document.getElementById("startGameButton").style.display = "block";
  });
});

// Обновление интерфейса статистики
function updateStatsUI(nickname, alliance, serverNumber) {
  const statsDiv = document.getElementById("stats");
  statsDiv.innerHTML = `
    Ник: ${nickname}
    Альянс: ${alliance}
    Сервер: №${serverNumber}
    Текущий счет: ${score}
    Рекорд: ${highScore}
  `;
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(nickname, alliance, serverNumber, bestScore) {
  const message = `🏆 Результаты игры:\nНик: ${nickname}\nАльянс: ${alliance}\nСервер: №${serverNumber}\nНаилучший счет: ${bestScore}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;
  try {
    await fetch(url);
    console.log("Сообщение отправлено в Telegram!");
    alert("Результат отправлен в группу!");
  } catch (error) {
    console.error("Ошибка при отправке сообщения в Telegram:", error);
    alert("Ошибка при отправке результата. Попробуйте еще раз.");
  }
}

// Начало игры
document.getElementById("startGameButton").addEventListener("click", () => {
  canvas.style.display = "block"; // Показываем холст
  initGame();
  update();
  document.getElementById("startGameButton").style.display = "none";
  document.getElementById("sendResultButton").style.display = "none";
});

// Инициализация игры
function initGame() {
  snake = [];
  generateSnakePath();
  bullets = [];
  score = 0;
  isGameOver = false;
  currentSegmentIndex = 0;
  lastSegmentTime = Date.now();
}

// Генерация пути змейки
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = 0;

function generateSnakePath() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let radius = Math.min(canvas.width, canvas.height) / 2 - gridSize; // Начальный радиус
  let segmentsPerCircle = [9, 8, 8, 7, 6, 6, 5]; // Количество сегментов на каждый круг
  for (let i = 0; i < segmentsPerCircle.length; i++) {
    const segments = segmentsPerCircle[i];
    const angleStep = (2 * Math.PI) / segments;
    for (let j = 0; j < segments; j++) {
      const angle = j * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      snakePath.push({ x: x, y: y });
    }
    radius -= gridSize; // Уменьшаем радиус для следующего круга
  }
  // Добавляем финальные шаги к центру
  for (let i = 0; i < 5; i++) {
    const x = centerX + (radius - i * gridSize) * Math.cos(0);
    const y = centerY + (radius - i * gridSize) * Math.sin(0);
    snakePath.push({ x: x, y: y });
  }
}

// Движение змеи
function moveSnake() {
  const currentTime = Date.now();
  // Добавляем новый сегмент каждую секунду
  if (currentTime - lastSegmentTime >= 1000 && currentSegmentIndex < snakePath.length) {
    const newSegment = { ...snakePath[currentSegmentIndex], color: colors[Math.floor(Math.random() * colors.length)] };
    snake.unshift(newSegment);
    currentSegmentIndex++;
    lastSegmentTime = currentTime;
  }
  // Если змея достигла конца пути
  if (currentSegmentIndex >= snakePath.length) {
    isGameOver = true;
    showPostGameOptions();
    return;
  }
}

// Отрисовка змеи
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, gridSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.closePath();
  });
}

// Отрисовка игрока
function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, gridSize, gridSize);
}

// Отрисовка направления выстрела
function drawAimLine() {
  if (isAiming) {
    ctx.strokeStyle = currentBulletColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x + gridSize / 2, player.y + gridSize / 2);
    ctx.lineTo(
      player.x + gridSize / 2 + aimDirection.x * 100,
      player.y + gridSize / 2 + aimDirection.y * 100
    );
    ctx.stroke();
  }
}

// Стрельба
let lastShotTime = 0; // Время последнего выстрела
function shootBullet(direction) {
  const bullet = {
    x: player.x,
    y: player.y,
    dx: direction.x,
    dy: direction.y,
    color: currentBulletColor
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
          // Если цвета совпадают, превращаем звено в слабый цвет
          segment.color = getWeakColor(segment.color);
        } else if (isStrongerColor(bullet.color, segment.color)) {
          // Если снаряд сильнее, удаляем звено
          snake.splice(segIndex, 1);
          score++;
          // Возвращаем голову змейки на одно звено назад
          if (snake.length > 0) {
            rollbackSnake();
          }
        } else {
          // Если снаряд слабее, изменяем цвет звена на цвет снаряда
          segment.color = bullet.color;
        }
        bullets.splice(index, 1); // Удаление снаряда
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

// Получение слабого цвета
function getWeakColor(color) {
  const colorOrder = ["red", "yellow", "green", "blue"];
  const currentIndex = colorOrder.indexOf(color);
  return colorOrder[(currentIndex + 1) % colorOrder.length];
}

// Проверка силы цвета (синий > красный > желтый > зеленый > синий)
function isStrongerColor(attacker, target) {
  const hierarchy = { blue: 'red', red: 'yellow', yellow: 'green', green: 'blue' };
  return hierarchy[attacker] === target;
}

// Обновление змейки при откате головы
function rollbackSnake() {
  if (snake.length > 0) {
    // Удаляем последний сегмент и уменьшаем индекс пути
    snake.pop();
    currentSegmentIndex = Math.max(0, currentSegmentIndex - 1);
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
