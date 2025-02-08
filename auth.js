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

    // Скрываем форму авторизации
    document.getElementById("authForm").style.display = "none";

    // Показываем выбор фракции
    document.getElementById("factionSelection").style.display = "flex";

    // Загружаем статистику
    if (typeof loadStats === "function") {
      loadStats();
    } else {
      console.error("Функция loadStats не определена!");
    }

    // Обновляем интерфейс статистики
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

    // Скрываем выбор фракции
    document.getElementById("factionSelection").style.display = "none";

    // Показываем кнопку "Начать игру" с мигающим золотым цветом
    document.getElementById("startGameButton").style.display = "block";
  });
});

// Начало игры
document.getElementById("startGameButton").addEventListener("click", () => {
  // Скрываем видео
  document.getElementById("videoContainer").style.display = "none";

  // Показываем игровое поле
  document.getElementById("gameCanvas").style.display = "block";

  // Запускаем игру
  initGame();
  update();
});
