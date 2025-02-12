import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';

// Создание сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Добавление света
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// Пол (трава)
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Змейка (простая цепочка сфер)
const snake = [];
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // Цвета фрагментов змеи
for (let i = 0; i < 10; i++) {
    const segmentMaterial = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
    const segment = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), segmentMaterial);
    segment.position.set(0, 0.5, -i * 1.2);
    scene.add(segment);
    snake.push(segment);
}

// Игрок (белый куб)
const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0.5, 0);
scene.add(player);

// Снаряды
const bullets = [];
const bulletGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

// Установка позиции камеры
camera.position.set(0, 5, 10);
camera.lookAt(0, 0.5, 0);

// Переменные для управления игрой
let isAiming = false;
let aimDirection = new THREE.Vector3(0, 0, -1); // Направление прицеливания
let currentBulletColor = 0xff0000; // Цвет снаряда по умолчанию
let score = 0;

// Анимация змейки
let angle = 0;
function animate() {
    requestAnimationFrame(animate);

    // Движение змеи
    angle += 0.02;
    for (let i = 0; i < snake.length; i++) {
        let t = angle - i * 0.3;
        snake[i].position.x = Math.sin(t) * 2;
        snake[i].position.z = Math.cos(t) * 2 - i * 0.6;
    }

    // Обновление снарядов
    bullets.forEach((bullet, index) => {
        bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(0.1));

        // Проверка столкновений
        snake.forEach((segment, segIndex) => {
            if (bullet.position.distanceTo(segment.position) < 0.6) {
                if (bullet.material.color.getHex() === segment.material.color.getHex()) {
                    // Если цвета совпадают, уничтожаем сегмент
                    scene.remove(segment);
                    snake.splice(segIndex, 1);
                    score++;
                } else {
                    // Если цвета не совпадают, меняем цвет сегмента
                    segment.material.color.set(bullet.material.color);
                }
                scene.remove(bullet);
                bullets.splice(index, 1);
            }
        });

        // Удаление снарядов за пределами экрана
        if (bullet.position.length() > 20) {
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });

    renderer.render(scene, camera);
}
animate();

// Управление мышью
document.addEventListener("mousedown", () => {
    isAiming = true;
});
document.addEventListener("mousemove", (event) => {
    if (isAiming) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const direction = raycaster.ray.direction;
        aimDirection.copy(direction).normalize();
    }
});
document.addEventListener("mouseup", () => {
    if (isAiming) {
        shootBullet();
        isAiming = false;
    }
});

// Стрельба
function shootBullet() {
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: currentBulletColor });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(player.position);
    bullet.userData.velocity = aimDirection.clone().multiplyScalar(5);
    scene.add(bullet);
    bullets.push(bullet);
}

// Управление сенсором
document.addEventListener("touchstart", () => {
    isAiming = true;
});
document.addEventListener("touchmove", (event) => {
    if (isAiming) {
        const touch = event.touches[0];
        const mouse = new THREE.Vector2();
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const direction = raycaster.ray.direction;
        aimDirection.copy(direction).normalize();
    }
});
document.addEventListener("touchend", () => {
    if (isAiming) {
        shootBullet();
        isAiming = false;
    }
});
