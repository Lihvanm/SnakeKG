coли
// Логика змейки
function moveSnake() {
  const currentTime = Date.now();

  // Добавляем новый сегмент каждую секунду
  if (currentTime - lastSegmentTime >= 1000 && currentSegmentIndex < snakePath.length) {
    const newSegment = { ...snakePath[currentSegmentIndex], color: colors[Math.floor(Math.random() * colors.length)] };
    snake.unshift(newSegment); // Добавляем новый сегмент в начало змейки
    currentSegmentIndex++;
    lastSegmentTime = currentTime;
  }

  // Если змейка достигла конца пути
  if (currentSegmentIndex >= snakePath.length) {
    isGameOver = true;
    showPostGameOptions();
    return;
  }
}

// Обработка столкновений
function handleCollision() {
  bullets.forEach((bullet, index) => {
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
          snake.splice(segIndex, 1); // Удаляем голову змейки
          score++;
          // Возвращаем голову змейки на одно звено назад
          if (snake.length > 0) {
            snake.unshift(snakePath[currentSegmentIndex - 1]);
            currentSegmentIndex--;
          }
        } else {
          // Если снаряд слабее, изменяем цвет звена на цвет снаряда
          segment.color = bullet.color;
        }
        bullets.splice(index, 1); // Удаление снаряда
      }
    });
  });
}