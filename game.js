// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ... (все предыдущие переменные и функции из предыдущего ответа остаются без изменений)

// ========== ДОБАВЛЕННЫЕ ФУНКЦИИ ========== //

function loadStats() {
  highScore = parseInt(localStorage.getItem("highScore")) || 0;
}

function saveStats() {
  highScore = Math.max(highScore, score);
  localStorage.setItem("highScore", highScore);
}

function updateStatsUI(nickname, alliance, server) {
  document.getElementById("stats").innerHTML = `
    <p>Игрок: ${nickname}</p>
    <p>Альянс: ${alliance}</p>
    <p>Сервер: ${server}</p>
    <p>Счет: ${score}</p>
    <p>Рекорд: ${highScore}</p>
  `;
}

function showPostGameOptions() {
  document.getElementById("postGameOptions").style.display = "block";
  saveStats();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = segment.color;
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });
}

function drawPlayer() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, gridSize/3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBullets() {
  bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, gridSize/6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawAimLine() {
  if (isAiming) {
    ctx.strokeStyle = currentBulletColor;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + aimDirection.x * 100, player.y + aimDirection.y * 100);
    ctx.stroke();
  }
}

function handleCollision() {
  bullets.forEach((bullet, index) => {
    snake.forEach((segment, segIndex) => {
      const distance = Math.sqrt(
        Math.pow(bullet.x - segment.x, 2) + 
        Math.pow(bullet.y - segment.y, 2)
      );
      
      if (distance < gridSize) {
        if (bullet.color === segment.color) {
          segment.color = getWeakColor(segment.color);
        } else if (isStrongerColor(bullet.color, segment.color)) {
          snake.splice(segIndex, 1);
          score++;
          if (snake.length > 0) {
            snake.unshift(snakePath[currentSegmentIndex - 1]);
            currentSegmentIndex--;
          }
        } else {
          segment.color = bullet.color;
        }
        bullets.splice(index, 1);
      }
    });
  });
}

function getWeakColor(color) {
  const weakColors = {
    red: "#ff6666",
    blue: "#6666ff",
    green: "#66ff66",
    yellow: "#ffff66"
  };
  return weakColors[color] || color;
}

function isStrongerColor(bulletColor, segmentColor) {
  const colorPriority = { red: 4, blue: 3, green: 2, yellow: 1 };
  return colorPriority[bulletColor] > colorPriority[segmentColor];
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ========== //
canvas.addEventListener("mousemove", (e) => {
  if (!isLoggedIn || isGameOver) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  aimDirection = {
    x: mouseX - player.x,
    y: mouseY - player.y
  };
  const length = Math.sqrt(aimDirection.x ** 2 + aimDirection.y ** 2);
  aimDirection.x /= length;
  aimDirection.y /= length;
});

canvas.addEventListener("mousedown", () => {
  if (!isLoggedIn || isGameOver) return;
  isAiming = true;
});

canvas.addEventListener("mouseup", () => {
  if (!isLoggedIn || isGameOver || !isAiming) return;
  
  bullets.push({
    x: player.x,
    y: player.y,
    dx: aimDirection.x * 10,
    dy: aimDirection.y * 10,
    color: currentBulletColor
  });
  
  isAiming = false;
});

// Обработчик перезапуска игры
document.getElementById("restartGameButton").addEventListener("click", () => {
  document.getElementById("postGameOptions").style.display = "none";
  initGame();
  update();
});

// Обработчик отправки результатов
document.getElementById("sendResultButtonPostGame").addEventListener("click", () => {
  const nickname = document.getElementById("nicknameInput").value.trim();
  const alliance = document.getElementById("allianceInput").value.trim();
  const serverNumber = document.getElementById("serverInput").value.trim();
  sendTelegramMessage(nickname, alliance, serverNumber, highScore);
});
