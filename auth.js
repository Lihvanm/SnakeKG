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

    if (typeof loadStats === "function") {
      loadStats();
    } else {
      console.error("Функция loadStats не определена!");
    }

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