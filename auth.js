// auth.js
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
    document.getElementById("factionSelection").style.display = "flex"; // Показываем выбор фракции
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
      inputs[currentIndex + 1].focus(); // Переходим к следующему полю
    } else {
      handleLogin(); // Если это последнее поле, выполняем вход
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
    document.getElementById("factionSelection").style.display = "none"; // Скрываем выбор фракции
    document.getElementById("startGameButton").style.display = "block"; // Показываем кнопку "Начать игру"
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
