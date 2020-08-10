function resetGame() {
  frameCnt = 0;
  gameoverCnt = 0;
  point = 0;
  gameState = "playing";
  userStartAudio();
  bgm.setVolume(0.2);
  bgm.loop();
  entities = [];
  entities_2 = [];
  entities.push(new Player());
  entities.push(new Ground());
}

function updateGame() {
  for (let e of entities) e.update();
  entities = entities.filter(x => x.isAlive());
  entities_2.forEach(x => entities.push(x));
  entities_2 = [];
  if (frameCount % 30 == 0) {
    for (let i = 0; i < frameCnt / 1200; i++) {
      entities.push(new Enemy());
    }
  }
}

function drawGame() {
  for (let e of entities) e.display();
  fill(10);
  noStroke();
  textSize(12);
  text(point, 30, 20);
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
    super(width / 2, height - 80, 0, 0);
    this.w = 50;
    this.h = 10;
    this.angle = 0;
    this.max_speed = 3;
  }

  isAlive() {
    return true;
  }

  update() {
    if (input.pos().x < this.pos.x) this.vel.x -= 0.3;
    else if (input.pos().x > this.pos.x) this.vel.x += 0.3;
    if (abs(this.vel.x) > this.max_speed) this.vel.x = (this.vel.x > 0 ? 1 : -1) * this.max_speed;
    this.pos.add(this.vel);
    this.angle = p5.Vector.sub(createVector(input.pos().x, input.pos().y), this.pos).heading();
  }

  display() {
    fill(10);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

class Enemy extends Entity {
  constructor() {
    super(random(0, width), 0, (random(1) > 0.5 ? 0.3 : -0.3), 2);
    this.safe = true;
  }

  isAlive() {
    if (this.safe == false) {
      se_bomb.play();
      point++;
      for (let i = 0; i < 20; i++)entities_2.push(new Particle(this.pos.x, this.pos.y, color(250, 50, 50)));
    }
    return -20 < this.pos.x && this.pos.x < width + 20 && -20 < this.pos.y && this.pos.y < height + 20 && this.safe;
  }

  update() {
    for (let e of entities) {
      if (!(e instanceof Bullet)) continue;
      if (entitiesAreCollidingCircle(this, e, 15)) this.safe = false;
    }
    if (entitiesAreCollidingCircle(this, { pos: createVector(input.pos().x, input.pos().y) }, 60) && frameCount % 20 === 0) entities.push(new Bullet(this.pos));
    this.pos.add(this.vel);
  }

  display() {
    stroke(250, 50, 50);
    fill(250, 50, 50);
    rect(this.pos.x, this.pos.y, 20, 20);
  }
}

class Bullet extends Entity {
  constructor(target) {
    super(entities[0].pos.x, entities[0].pos.y, 0, 0);
    this.vel = p5.Vector.sub(createVector(input.pos().x, input.pos().y), this.pos);
    this.vel.mult(0.06);
    this.gravity = 0.2;
  }

  update() {
    this.vel.y += this.gravity;
    this.pos.add(this.vel);
  }

  display() {
    fill(10);
    stroke(10);
    ellipse(this.pos.x, this.pos.y, 10, 10);
  }
}

class Ground extends Entity {
  constructor() {
    super(width / 2, height - 25, 0, 0);
    this.w = width;
    this.h = 50;
  }

  update() {
    let ww = this.w / 2 + 10;
    let hh = this.h / 2 + 10;
    for (let e of entities) {
      if (!(e instanceof Enemy)) continue;
      if (entitiesAreCollidingRect(this, e, ww, hh)) gameover();
    }
  }

  display() {
    stroke(10);
    noFill()
    rect(this.pos.x, this.pos.y, this.w, this.h);
  }
}

class Particle extends Entity {
  constructor(x, y, color) {
    super(x, y, 0, 0);
    this.direction = random(TWO_PI);
    this.angle = 0;
    this.angle_speed = random(-0.3, 0.3);
    this.speed = 2;
    this.life = 1;
    this.color = color;
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
    let c = color(this.color.levels[0], this.color.levels[1], this.color.levels[2], 255 * this.life);
    stroke(c);
    fill(c);
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
  fill(10);
  textSize(20);
  text("snipe", width / 2, height / 2);
  textSize(10);
  text("[mouse or touch]", width / 2, height / 2 + 80);
  if (input.isJustPressed()) resetGame();
}

function drawGameoverScreen() {
  background(0, 192);
  noStroke();
  fill(250);
  textSize(54);
  text("RESULT", width / 2, height / 2 - 100);
  textSize(24);
  text("time:" + (frameCnt / 60).toFixed(2), width / 2, height / 2 + 100);
  text("point:" + point, width / 2, height / 2 + 150);
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