// Инициализация сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);

// Платформа
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Игрок
const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0.25, 0);
scene.add(player);

// Змея
let snake = [];
const snakeColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
function createSnakeSegment(position) {
  const segmentGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const segmentMaterial = new THREE.MeshStandardMaterial({ color: snakeColors[Math.floor(Math.random() * snakeColors.length)] });
  const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
  segment.position.copy(position);
  scene.add(segment);
  return segment;
}

// Генерация змейки
function generateSnakePath() {
  const centerX = 0;
  const centerY = 0;
  let radius = 4; // Начальный радиус
  let segmentsPerCircle = [9, 8, 8, 7, 6, 6, 5]; // Количество сегментов на каждый круг

  for (let i = 0; i < segmentsPerCircle.length; i++) {
    const segments = segmentsPerCircle[i];
    const angleStep = (2 * Math.PI) / segments;
    for (let j = 0; j < segments; j++) {
      const angle = j * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      snake.push(createSnakeSegment(new THREE.Vector3(x, 0.25, y)));
    }
    radius -= 0.5; // Уменьшаем радиус для следующего круга
  }
}

generateSnakePath();

// Снаряды
let bullets = [];
function shootBullet(direction) {
  const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.copy(player.position);
  bullets.push({ mesh: bullet, direction });
  scene.add(bullet);
}

// Обновление игры
function update() {
  // Перемещение снарядов
  bullets.forEach((bullet, index) => {
    bullet.mesh.position.addScaledVector(bullet.direction, 0.1);
    // Удаление снаряда за пределами экрана
    if (bullet.mesh.position.length() > 10) {
      scene.remove(bullet.mesh);
      bullets.splice(index, 1);
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

// Управление
let isAiming = false;
let aimDirection = new THREE.Vector3();
document.addEventListener("mousedown", () => (isAiming = true));
document.addEventListener("mousemove", (event) => {
  if (isAiming) {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    aimDirection.set(mouse.x, 0, mouse.y).normalize();
  }
});
document.addEventListener("mouseup", () => {
  if (isAiming) {
    shootBullet(aimDirection);
    isAiming = false;
  }
});

// Позиционирование камеры
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Запуск игры
update();
