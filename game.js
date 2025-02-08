// Инициализация сцены, камеры и рендерера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);

// Игрок
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0, 0);
scene.add(player);

// Змейка
const snakeSegments = [];
const snakeRadius = 5; // Радиус круга, по которому движется змейка
const snakeSpeed = 0.02; // Скорость движения змейки
let snakeAngle = 0; // Угол движения змейки
let snakeCircles = 0; // Количество сделанных кругов

function createSnakeSegment() {
  const segmentGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const segmentMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
  scene.add(segment);
  snakeSegments.push(segment);
}

// Создаем змейку из 10 звеньев
for (let i = 0; i < 10; i++) {
  createSnakeSegment();
}

// Снаряды
const bullets = [];
const bulletSpeed = 0.2; // Скорость снаряда
const fireRate = 200; // Задержка между выстрелами (в миллисекундах)
let lastShotTime = 0;

function shootBullet() {
  const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.copy(player.position);
  scene.add(bullet);

  // Направление выстрела
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  bullet.direction = direction.normalize();

  bullets.push(bullet);
}

// Управление стрельбой
document.addEventListener("click", () => {
  const currentTime = Date.now();
  if (currentTime - lastShotTime >= fireRate) {
    shootBullet();
    lastShotTime = currentTime;
  }
});

// Камера
camera.position.set(0, 10, 10);
camera.lookAt(player.position);

// Анимация
function animate() {
  requestAnimationFrame(animate);

  // Движение змейки
  snakeAngle += snakeSpeed;
  snakeSegments.forEach((segment, index) => {
    const angle = snakeAngle + (index * 0.1);
    segment.position.x = Math.cos(angle) * snakeRadius;
    segment.position.z = Math.sin(angle) * snakeRadius;
  });

  // Проверка на завершение круга
  if (snakeAngle >= 2 * Math.PI) {
    snakeAngle = 0;
    snakeCircles++;
    if (snakeCircles >= 4) {
      // Змейка атакует игрока
      alert("Змейка атаковала вас! Игра окончена.");
      resetGame();
    }
  }

  // Движение снарядов
  bullets.forEach((bullet, index) => {
    bullet.position.add(bullet.direction.multiplyScalar(bulletSpeed));

    // Удаление снаряда за пределами сцены
    if (bullet.position.distanceTo(player.position) > 20) {
      scene.remove(bullet);
      bullets.splice(index, 1);
    }
  });

  renderer.render(scene, camera);
}

// Сброс игры
function resetGame() {
  snakeAngle = 0;
  snakeCircles = 0;
  bullets.forEach(bullet => scene.remove(bullet));
  bullets.length = 0;
}

// Запуск анимации
animate();

// Адаптация под изменение размера окна
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
