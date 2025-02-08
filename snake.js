const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки игры
const gridSize = 20; // Размер клетки
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
let currentBulletColor = colors[Math.floor(Math.random() * colors.length)];

// Telegram Bot API
const TELEGRAM_BOT_TOKEN = "7763147422:AAGPWCetxPUsAuhvCknqVFrZId_r0BPSEhE"; // Токен вашего бота
const TELEGRAM_CHAT_ID = "-1002382138419"; // ID группы Snake_KG

// Авторизация
document.getElementById("loginButton").addEventListener("click", () => {
  const alliance = document.getElementById("allianceInput").value;
  const serverNumber = document.getElementById("serverInput").value;
  if (alliance && serverNumber) {
    isLoggedIn = true;
    alert(`Добро пожаловать, ${alliance}! Сервер №${serverNumber}`);
    document.getElementById("authForm").style.display = "none"; // Скрываем форму авторизации
    document.getElementById("gameButtons").style.display = "block"; // Показываем кнопки
    loadStats();
    updateStatsUI(alliance, serverNumber);
  } else {
    alert("Пожалуйста, заполните все поля.");
  }
});

// Обновление интерфейса статистики
function updateStatsUI(alliance, serverNumber) {
  const statsDiv = document.getElementById("stats");
  statsDiv.innerHTML = `
    <p>Альянс: ${alliance}</p>
    <p>Сервер: №${serverNumber}</p>
    <p>Текущий счет: ${score}</p>
    <p>Рекорд: ${highScore}</p>
  `;
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(alliance, serverNumber, bestScore) {
  const message = `🏆 Результаты игры:\nАльянс: ${alliance}\nСервер: №${serverNumber}\nНаилучший счет: ${bestScore}`;
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
  document.getElementById("videoContainer").style.display = "none"; // Скрываем видео
  canvas.style.display = "block"; // Показываем холст
  initGame();
  update();
  document.getElementById("startGameButton").style.display = "none";
  document.getElementById("sendResultButton").style.display = "none";
});

// Инициализация игры
function initGame() {
  snake = [];
  for (let i = 0; i < 50; i++) {
    snake.push({ x: canvas.width - gridSize - i * gridSize, y: 0, color: colors[Math.floor(Math.random() * colors.length)] });
  }
  bullets = [];
  score = 0;
  isGameOver = false;
}

// Отрисовка змеи
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.beginPath();
    ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, gridSize / 3, 0, Math.PI * 2); // Рисуем круглые сегменты
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.closePath();
  });
}

// Движение змеи по прямоугольной спирали
function moveSnake() {
  const head = { ...snake[0] };

  // Определяем направление движения
  if (head.x > canvas.width / 2 && head.y === 0) {
    head.x -= gridSize; // Движение влево
  } else if (head.x === canvas.width / 2 && head.y < canvas.height / 2) {
    head.y += gridSize; // Движение вниз
  } else if (head.x < canvas.width && head.y === canvas.height / 2) {
    head.x += gridSize; // Движение вправо
  } else if (head.x === canvas.width && head.y > 0) {
    head.y -= gridSize; // Движение вверх
  }

  // Если голова достигла центра
  if (Math.abs(head.x - canvas.width / 2) <= gridSize && Math.abs(head.y - canvas.height / 2) <= gridSize) {
    isGameOver = true;
    alert("Game Over! Your score: " + score);
    document.getElementById("sendResultButton").style.display = "block";
    return;
  }

  // Обновляем позиции всех сегментов
  snake.unshift(head);
  snake.pop();
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
          snake.splice(segIndex, 1); // Уничтожение фрагмента
          bullets.splice(index, 1); // Удаление снаряда
          score++;
        } else {
          segment.color = bullet.color; // Изменение цвета фрагмента
          bullets.splice(index, 1); // Удаление снаряда
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

  moveSnake();
  drawSnake();
  drawPlayer();
  drawBullets();
  drawAimLine(); // Отрисовка направления выстрела
  drawStats();

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
    const dx = mouseX - (player.x + gridSize / 2);
    const dy = mouseY - (player.y + gridSize / 2);
    const length = Math.sqrt(dx * dx + dy * dy);
    aimDirection = { x: dx / length, y: dy / length };
  }
});
canvas.addEventListener("mouseup", () => {
  if (isAiming) {
    shootBullet(aimDirection);
    isAiming = false;
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
    const dx = touchX - (player.x + gridSize / 2);
    const dy = touchY - (player.y + gridSize / 2);
    const length = Math.sqrt(dx * dx + dy * dy);
    aimDirection = { x: dx / length, y: dy / length };
  }
});
canvas.addEventListener("touchend", () => {
  if (isAiming) {
    shootBullet(aimDirection);
    isAiming = false;
  }
});

// Отправка результата
document.getElementById("sendResultButton").addEventListener("click", () => {
  const alliance = document.getElementById("allianceInput").value;
  const serverNumber = document.getElementById("serverInput").value;
  sendTelegramMessage(alliance, serverNumber, score);
  saveStats();
  document.getElementById("sendResultButton").style.display = "none";
  document.getElementById("startGameButton").style.display = "block";
});
