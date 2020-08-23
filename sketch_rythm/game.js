function resetGame() {
  frameCnt = 0;
  gameoverCnt = 0;
  killEnemy = 0;
  shakeMagnitude = 0;
  shakeDampingFactor = 0.95;
  gameState = "playing";
  // userStartAudio();
  // bgm.setVolume(0.2);
  // bgm.loop();
  entities = [];
  entities_2 = [];
}

function updateGame() {
  for (let e of entities) e.update();
  entities = entities.filter(x => x.isAlive());
  entities_2.forEach(x => entities.push(x));
  entities_2 = [];
  updateShake();
}

function drawGame() {
  applyShake();
  for (let e of entities) e.display();
}

class Entity {
  constructor(x, y, vx, vy) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
  }

  isAlive() {
    return 0 < this.pos.x && this.pos.x < width && 0 < this.pos.y && this.pos.y < height;
  }

  update() { }
  display() { }
}

class Particle extends Entity {
  constructor(x, y) {
    super(x, y, 0, 0);
    this.direction = random(TWO_PI);
    this.angle = 0;
    this.angle_speed = random(-0.3, 0.3);
    this.speed = 2;
    this.life = 1;
  }

  isAlive() {
    return 0 <= this.life;
  }

  update() {
    this.life -= 0.02;
    this.pos.x += this.speed * cos(this.direction);
    this.pos.y += this.speed * sin(this.direction);
    this.angle += this.angle_speed;
  }

  display() {
    stroke(10);
    fill(10, 255 * this.life);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    triangle(0, 5.7, -5, -2.8, 5, -2.8);
    pop();
  }
}

function gameover() {
  bgm.stop();
  se_gameover.play();
  gameState = "gameover";
}

function drawOpeningScreen() {
  background(250);
  fill(0);
  textSize(20);
  text("rpc rythm", width / 2, height / 2);
  textSize(10);
  text("press any key.", width / 2, height / 2 + 80);
  if (input.isJustPressed()) resetGame();
}

function drawGameoverScreen() {
  background(0, 192);
  noStroke();
  fill(255);
  textSize(54);
  text("RESULT", width / 2, height / 2 - 100);
  textSize(24);
  text("time:" + (frameCnt / 60).toFixed(2), width / 2, height / 2 + 100);
}

function entitiesAreCollidingRect(
  entityA,
  entityB,
  collisionXDistance,
  collisionYDistance
) {
  // xとy、いずれかの距離が十分開いていたら、衝突していないので false を返す

  let currentXDistance = abs(entityA.pos.x - entityB.pos.x); // 現在のx距離
  if (collisionXDistance <= currentXDistance) return false;

  let currentYDistance = abs(entityA.pos.y - entityB.pos.y); // 現在のy距離
  if (collisionYDistance <= currentYDistance) return false;

  return true; // ここまで来たら、x方向でもy方向でも重なっているので true
}

function entitiesAreCollidingCircle(
  entityA,
  entityB,
  collisionDistance
) {
  let currentDistance = p5.Vector.dist(entityA.pos, entityB.pos);
  if (currentDistance >= collisionDistance) return false;
  return true;
}

function setShake(magnitude) {
  shakeMagnitude = magnitude;
}

function updateShake() {
  shakeMagnitude *= shakeDampingFactor;
}

function applyShake() {
  if (shakeMagnitude < 1) return;

  translate(
    random(-shakeMagnitude, shakeMagnitude),
    random(-shakeMagnitude, shakeMagnitude)
  );
}