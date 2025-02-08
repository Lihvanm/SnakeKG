// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Базовые настройки
const gridSize = 71;
let isLoggedIn = false;
let currentBulletColor = "red";

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
  startGame();
});

// Основная игровая логика
function startGame() {
  // Простая отрисовка для проверки
  ctx.fillStyle = currentBulletColor;
  ctx.fillRect(100, 100, 100, 100);
  
  // Добавим текст для проверки
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Игра запущена!", 200, 200);
}
