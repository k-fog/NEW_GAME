function resetGame() {
  frameCnt = 0;
  gameoverCnt = 0;
  killEnemy = 0;
  shakeMagnitude = 0;
  shakeDampingFactor = 0.95;
  gameState = "playing";
  userStartAudio();
  bgm.setVolume(0.2);
  bgm.loop();
  entities = [];
  entities_2 = [];
  entities.push(new Player());
}

function updateGame() {
  for (let e of entities) e.update();
  entities = entities.filter(x => x.isAlive());
  entities_2.forEach(x => entities.push(x));
  entities_2 = [];
  if (frameCnt % 60 === 0 && random(1) < 0.5) entities.push(new Enemy(random(100, width - 100)));
  updateShake();
}

function drawGame() {
  applyShake();
  for (let e of entities) e.display();
  fill(0);
  noStroke();
  textSize(12);
  text(killEnemy, 30, 20);
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


class Player extends Entity {
  constructor() {
    super(width / 2, height - 100, 0, 0);
    this.life = 10;
    this.w = 30;
    this.h = 30;
  }

  isAlive() {
    return true;
  }

  update() {
    let spd = 4;
    switch (device.value()) {
      case "mobile":
        let temp = createVector(input.diff().x, input.diff().y);
        temp.normalize();
        this.vel = temp.mult(spd);
        break;
      case "PC":
        this.vel.x = input.keyArrow().left * spd + input.keyArrow().right * spd;
        this.vel.y = input.keyArrow().up * spd + input.keyArrow().down * spd;
        break;
    }

    this.pos.add(this.vel);
    if (this.pos.x < 0) this.pos.x = 0;
    else if (width < this.pos.x) this.pos.x = width;
    if (this.pos.y < 0) this.pos.y = 0;
    else if (height < this.pos.y) this.pos.y = height;

    if (frameCount % 15 == 0) entities.push(new Bullet("player", this.pos.x, this.pos.y - 10, 20, -HALF_PI, color(10)));

    for (let i of entities) {
      if (!(i instanceof Bullet)) continue;
      if (i.parent == "player") continue;
      if (entitiesAreCollidingCircle(this, i, 8)) {
        this.life--;
        i.pos = createVector(1000, 1000);
      }
    }

    if (this.life <= 0) gameover();
  }

  display() {
    noStroke();
    fill(10);
    rect(this.pos.x, this.pos.y, this.w, this.h, 8);
    let x = map(this.life, 0, 10, 0, width);
    rect(width / 2, height - 5, x, 10);
  }
}

class Enemy extends Entity {
  constructor(x) {
    super(x, 0, 0, 1);
    this.life = 3;
    this.danmaku = floor(random(6));
  }

  isAlive() {
    if (this.life <= 0) {
      for (let i = 0; i < 20; i++) entities_2.push(new Particle(this.pos.x, this.pos.y));
      killEnemy++;
      setShake(5);
      return false;
    }
    return -20 < this.pos.x && this.pos.x < width + 20 && -20 < this.pos.y && this.pos.y < height + 20;
  }

  update() {
    switch (this.danmaku) {
      case 0:
        Danmaku.all_direction(this.pos);
        break;
      case 1:
        Danmaku.all_direction(this.pos);
        Danmaku.swirl(this.pos);
        break;
      case 2:
        Danmaku.swirl(this.pos);
        break;
      case 3:
        Danmaku.line(this.pos);
        break;
      case 4:
        Danmaku.d01(this.pos);
        break;
      case 5:
        Danmaku.d02(this.pos);
        break;
    }

    for (let i of entities) {
      if (!(i instanceof Bullet)) continue;
      if (i.parent == "enemy") continue;
      if (entitiesAreCollidingCircle(this, i, 20)) {
        this.life--;
        i.pos = createVector(1000, 1000);
      }
    }

    this.pos.add(this.vel);
    if (this.pos.y < 0) gameover();
  }

  display() {
    fill(250);
    stroke(0);
    rect(this.pos.x, this.pos.y, 40, 10, 8);
  }
}

class Bullet extends Entity {
  constructor(parent, x, y, speed, angle, color) {
    super(x, y, cos(angle) * speed, sin(angle) * speed);
    this.angle = angle;
    this.angle_speed = undefined;
    this.speed = speed;
    this.color = color;
    this.parent = parent;
  }

  update() {
    if (this.angle_speed) {
      this.angle += this.angle_speed;
      this.vel.x = cos(this.angle) * this.speed;
      this.vel.y = sin(this.angle) * this.speed;
    }
    this.pos.add(this.vel);
  }

  display() {
    fill(this.color);
    stroke(0);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rect(0, 0, 15, 6);
    pop();
  }
}

class Danmaku {
  static all_direction(pos) {
    if (frameCount % 30 === 0) {
      let offset = random(0, HALF_PI);
      for (let i = 0; i < 360; i += 15) {
        entities.push(new Bullet("enemy", pos.x, pos.y, 5, radians(i) + offset, color(250)));
      }
    }
  }

  static swirl(pos) {
    if (!this.angle) this.angle = 0;
    if (frameCount % 3 === 0) {
      if (this.angle >= 360) this.angle = 0;
      entities.push(new Bullet("enemy", pos.x, pos.y, 5, radians(this.angle), color(250)));
      this.angle += 7;
    }
  }

  static line(pos) {
    if (frameCount % 60 === 1 || !this.targetVector1) {
      this.targetVector1 = p5.Vector.sub(entities[0].pos, createVector(width / 2 - 200, pos.y));
      this.targetVector2 = p5.Vector.sub(entities[0].pos, createVector(width / 2 + 200, pos.y));
    }
    if (frameCount % 60 < 30 && frameCount % 5 === 1) {
      entities.push(new Bullet("enemy", width / 2 - 200, pos.y, 5, this.targetVector1.heading(), color(250)));
    }
    if (frameCount % 60 < 30 && frameCount % 5 === 1) {
      entities.push(new Bullet("enemy", width / 2 + 200, pos.y, 5, this.targetVector2.heading(), color(250)));
    }
  }

  static d01(pos) {
    if (frameCount % 40 < 10) {
      for (let i = 0; i < 6; i++) {
        entities.push(new Bullet("enemy", pos.x, pos.y, (frameCount % 30) / 10.0 + 4.0, frameCount / 20.0 + TWO_PI / 6 * i, color(250)));
      }
    }
  }

  static d02(pos) {
    if (frameCount % 50 < 6) {
      let offset = random(0, HALF_PI);
      for (let i = 0; i < 360; i += 30) {
        let b = new Bullet("enemy", pos.x, pos.y, 8, radians(i) + offset, color(250));
        if (i % 60 === 0) b.angle_speed = 0.01;
        else b.angle_speed = -0.01;
        entities.push(b);
      }
    }
  }
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
  text("rpc shooting", width / 2, height / 2);
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
  text("kill:" + killEnemy, width / 2, height / 2 + 150);
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