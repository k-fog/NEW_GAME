function resetGame() {
  gameState = "playing"
  bgm.setVolume(0.2);
  bgm.loop();
  point = 0;
  onMountain = false;
  player = new Player();
  ground = [];
  particles = [];
}

function updateGame() {
  if (gameState === "gameover") {
    if (input.isPressed()) {
      resetGame();
    }
    return;
  }
  if (frameCount % 30 == 0 && onMountain == false) ground.push(new Mountain(frameCount % 300 == 0));
  ground = ground.filter(x => x.isAlive());
  particles = particles.filter(x => x.isAlive());
  ground.forEach(x => x.update());
  particles.forEach(x => x.update());
  player.update();
  if (input.isJustPressed() && onMountain) onMountain = false;
}

function drawGame() {
  for (let mountain of ground) mountain.display();
  for (let particle of particles) particle.display();
  player.display();
  textSize(12);
  fill(0);
  text(point, 30, 20);
  if (gameState === "gameover") drawGameoverScreen();
}

class Entity {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  updatePosition() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

function entitiesAreColliding(
  entityA,
  entityB,
  collisionXDistance,
  collisionYDistance
) {
  // xとy、いずれかの距離が十分開いていたら、衝突していないので false を返す

  let currentXDistance = abs(entityA.x - entityB.x); // 現在のx距離
  if (collisionXDistance <= currentXDistance) return false;

  let currentYDistance = abs(entityA.y - entityB.y); // 現在のy距離
  if (collisionYDistance <= currentYDistance) return false;

  return true; // ここまで来たら、x方向でもy方向でも重なっているので true
}

class Mountain extends Entity {
  constructor(safe) {
    super(900, height / 2 + random(100, 400), -5, 0);
    this.safe = safe;
    if (this.safe) this.flag = true;
  }

  isAlive() {
    return -40 < this.x;
  }

  update() {
    if (this.safe && this.flag && this.x < 10) gameover();
    if (onMountain == true) this.vx = 0;
    else this.vx = -5;
    this.updatePosition();
  }

  display() {
    if (this.safe && this.flag == true) fill(10);
    else if (this.safe && this.flag == false) fill(100);
    else fill(255);
    rect(this.x, this.y, 80, 400, 8);
  }
}

class Player extends Entity {
  constructor() {
    super(100, height / 2, 0, 0);
  }

  applyGravity() {
    this.vy += 0.4;
  }

  update() {
    if (input.isJustPressed()) {
      se_jump.play();
      this.vy -= 3;
    }
    if (input.isPressed()) {
      particles.push(new Particle(this.x, this.y));
      this.vy -= 1.3;
    }
    this.updatePosition();
    this.applyGravity();
    if (this.y < 0) this.vy += 5;
    if (height < this.y) {
      gameover();
      return;
    }
    for (let mountain of ground) {
      if (entitiesAreColliding(this, mountain, 60, 220)) {
        if (mountain.safe) {
          this.vy = 0;
          this.y = mountain.y - 220;
          if (onMountain == true) break;
          se_te.play();
          point++;
          onMountain = true;
          mountain.flag = false;
        }
        else if (onMountain == false) {
          gameover();
          break;
        }
      }
    }
  }

  display() {
    fill(10);
    rect(this.x, this.y, 40, 40, 8);
  }
}

class Particle extends Entity {
  constructor(x, y) {
    super(x, y, 0, 0);
    this.direction = random(TWO_PI);
    this.speed = 2;
    this.life = 1;
  }

  isAlive() {
    return 0 <= this.life;
  }

  update() {
    this.life -= 0.02;
    this.x += this.speed * cos(this.direction);
    this.y += this.speed * sin(this.direction);
  }

  display() {
    fill(10, 255 * this.life);
    rect(this.x, this.y, 10, 10);
  }
}

function gameover() {
  bgm.stop();
  se_gameover.play();
  gameState = "gameover";
}

function drawGameoverScreen() {
  background(0, 192);
  fill(255);
  textSize(64);
  text("GAME OVER", width / 2, height / 2);
  textSize(24);
  text("point:" + point, width / 2, height / 2 + 100);
}
