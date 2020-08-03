function resetGame() {
  gameState = "play";
  player = createPlayer();
  blocks = [];
  frameCnt = 0;
  bgm.setVolume(0.2);
  bgm.loop();
}

function updateGame() {
  if (gameState === "gameover") return;
  if (frameCount % 120 === 1) addBlockPair(blocks);
  blocks = blocks.filter(blockIsAlive);
  updatePosition(player);
  for (let block of blocks) updatePosition(block);
  applyGravity(player);
  if (!playerIsAlive(player)) gameover();
  for (let block of blocks) {
    if (entitiesAreColliding(player, block, 20 + 40, 20 + 200)) {
      gameover();
      break;
    }
  }
  frameCnt++;
}

function drawGame() {
  background(250);
  noFill();
  drawPlayer(player);
  for (let block of blocks) drawBlock(block);
  fill(0);
  textSize(12);
  text((frameCnt / 60).toFixed(2), 30, 20);
  if (gameState === "gameover") drawGameoverScreen();
}

function onInput() {
  switch (gameState) {
    case "play":
      applyJump(player);
      se_jump.play();
      break;
    case "gameover":
      resetGame();
      break;
  }
}

function gameover() {
  gameState = "gameover";
  bgm.stop();
  se_gameover.play();
}

function updatePosition(entity) {
  entity.x += entity.vx;
  entity.y += entity.vy;
}

function createPlayer() {
  return {
    x:
      200,
    y:
      300,
    vx:
      0,
    vy:
      0,
  };
}

function applyGravity(entity) {
  entity.vy += 0.4;
}

function applyJump(entity) {
  entity.vy = -10;
}

function drawPlayer(entity) {
  square(entity.x, entity.y, 40, 8);
}

function createBlock(y) {
  return {
    x:
      900,
    y,
    vx:
      -2,
    vy:
      0,
  };
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

function playerIsAlive(entity) {
  return 0 < entity.y && entity.y < height;
}

function blockIsAlive(entity) {
  return -100 < entity.x;
}

function addBlockPair() {
  let y = random(-100, 100);
  blocks.push(createBlock(y)); // 上のブロック
  blocks.push(createBlock(y + 600)); // 下のブロック
}

function drawBlock(entity) {
  rect(entity.x, entity.y, 80, 400, 8);
}

function drawGameoverScreen() {
  background(0, 192);
  fill(255);
  textSize(64);
  text("GAME OVER", width / 2, height / 2);
  textSize(24);
  text("time:" + (frameCnt / 60).toFixed(2), width / 2, height / 2 + 100);
}
