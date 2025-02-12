// Импорт Babylon.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Создание сцены
const createScene = () => {
  const scene = new BABYLON.Scene(engine);

  // Камера в центре, змейка двигается вокруг
  const camera = new BABYLON.UniversalCamera(
    "camera",
    new BABYLON.Vector3(0, 2, 0),
    scene
  );
  camera.attachControl(canvas, true);
  camera.rotation.y = Math.PI; // Поворачиваем камеру назад

  // Свет
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // Земля
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 20, height: 20 },
    scene
  );
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
  ground.material = groundMat;

  // Небо
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100 }, scene);
  const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
  skyMat.backFaceCulling = false;
  skyMat.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1);
  skybox.material = skyMat;

  // Игрок (стреляющий объект)
  const shooter = BABYLON.MeshBuilder.CreatePlane(
    "shooter",
    { width: 2, height: 2 },
    scene
  );
  shooter.position = new BABYLON.Vector3(0, 1, -4);
  shooter.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  const shooterMat = new BABYLON.StandardMaterial("shooterMat", scene);
  shooterMat.diffuseTexture = new BABYLON.Texture(
    "https://cdn.glitch.global/e4754671-729d-42eb-906c-d8610131bf14/shooter_texture.png?v=1739325335302",
    scene
  );
  shooter.material = shooterMat;

  // Змейка (массив сегментов)
  let snake = [];
  const colors = [
    new BABYLON.Color3(1, 0, 0), // red
    new BABYLON.Color3(0, 1, 0), // green
    new BABYLON.Color3(0, 0, 1), // blue
    new BABYLON.Color3(1, 1, 0), // yellow
  ];
  const snakeLength = 10;
  for (let i = 0; i < snakeLength; i++) {
    let segment = BABYLON.MeshBuilder.CreateSphere(
      "segment" + i,
      { diameter: 1 },
      scene
    );
    segment.material = new BABYLON.StandardMaterial("segmentMat" + i, scene);
    segment.material.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
    snake.push(segment);
  }

  // Движение змейки вокруг центра
  let angle = 0;
  let speed = 0.02;
  scene.onBeforeRenderObservable.add(() => {
    angle += speed;
    let radius = 5;
    let headX = Math.cos(angle) * radius;
    let headZ = Math.sin(angle) * radius;
    for (let i = snake.length - 1; i > 0; i--) {
      snake[i].position = snake[i - 1].position.clone();
    }
    snake[0].position.x = headX;
    snake[0].position.z = headZ;
  });

  // Снаряды
  let bullets = [];
  let isAiming = false;
  let aimDirection = new BABYLON.Vector3();

  // Управление мышью
  canvas.addEventListener("mousedown", (event) => {
    isAiming = true;
  });
  canvas.addEventListener("mousemove", (event) => {
    if (isAiming) {
      const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
      if (pickInfo.hit) {
        aimDirection = pickInfo.pickedPoint.subtract(shooter.position).normalize();
      }
    }
  });
  canvas.addEventListener("mouseup", () => {
    if (isAiming) {
      shootBullet(aimDirection);
      isAiming = false;
    }
  });

  // Стрельба
  function shootBullet(direction) {
    const bullet = BABYLON.MeshBuilder.CreateSphere(
      "bullet",
      { diameter: 0.2 },
      scene
    );
    bullet.position = shooter.position.clone();
    bullet.material = new BABYLON.StandardMaterial("bulletMat", scene);
    bullet.material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Цвет снаряда
    bullets.push({ mesh: bullet, direction });
  }

  // Обновление снарядов
  scene.onBeforeRenderObservable.add(() => {
    bullets.forEach((bullet, index) => {
      bullet.mesh.position.addInPlace(bullet.direction.scale(0.1));
      // Проверка столкновений
      snake.forEach((segment, segIndex) => {
        if (bullet.mesh.intersectsMesh(segment)) {
          segment.dispose(); // Уничтожение сегмента
          snake.splice(segIndex, 1);
          bullet.mesh.dispose();
          bullets.splice(index, 1);
        }
      });
      // Удаление снарядов за пределами экрана
      if (bullet.mesh.position.length() > 10) {
        bullet.mesh.dispose();
        bullets.splice(index, 1);
      }
    });
  });

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
  scene.render();
});
window.addEventListener("resize", () => {
  engine.resize();
});
