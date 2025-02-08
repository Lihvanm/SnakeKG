// Добавляем недостающие переменные
let snakePath = [];
let currentSegmentIndex = 0;
let lastSegmentTime = 0;

// Исправляем функцию handleLogin
function handleLogin() {
  const nickname = document.getElementById("nicknameInput").value.trim();
  const alliance = document.getElementById("allianceInput").value.trim();
  const serverNumber = document.getElementById("serverInput").value.trim();

  if (nickname && alliance && serverNumber) {
    isLoggedIn = true;
    document.getElementById("authForm").style.display = "none";
    document.getElementById("factionSelection").style.display = "flex";
    document.getElementById("videoContainer").style.display = "none";
    
    // Инициализация игры после входа
    loadStats();
    updateStatsUI(nickname, alliance, serverNumber);
    
    // Показываем кнопки управления
    document.getElementById("gameButtons").style.display = "block";
  } else {
    alert("Заполните все поля!");
  }
}

// Добавляем функцию обновления статистики
function updateStatsUI(nickname, alliance, serverNumber) {
  const statsDiv = document.getElementById("stats");
  statsDiv.innerHTML = `
    <p>Ник: ${nickname}</p>
    <p>Альянс: ${alliance}</p>
    <p>Сервер: №${serverNumber}</p>
    <p>Счет: ${score}</p>
    <p>Рекорд: ${highScore}</p>
  `;
}

// Исправляем функцию shootBullet
function shootBullet(direction) {
  const currentTime = Date.now();
  if (currentTime - lastShotTime >= 500) {
    const bullet = {
      x: player.x + gridSize/2,
      y: player.y + gridSize/2,
      dx: direction.x * 5,
      dy: direction.y * 5,
      color: currentBulletColor
    };
    bullets.push(bullet);
    lastShotTime = currentTime;
  }
}

// Добавляем обработчик для кнопки "Начать игру"
document.getElementById("startGameButton").addEventListener("click", () => {
  canvas.style.display = "block";
  document.getElementById("startGameButton").style.display = "none";
  initGame();
  update();
});

// Исправляем функцию update
function update() {
  if (!isLoggedIn || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  moveSnake();
  drawSnake();
  drawPlayer();
  drawBullets();
  drawAimLine();
  drawStats();

  requestAnimationFrame(update);
}
