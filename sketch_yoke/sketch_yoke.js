"use strict";

let input;
let gameState;
let entities;
let entities_2;
let frameCnt;
let gameoverCnt;
let killEnemy;
let device;
let shakeMagnitude;
let shakeDampingFactor;
let se_jump, se_te, se_gameover, bgm;

function preload() {
  se_gameover = loadSound("./data/se_gameover.mp3");
  bgm = loadSound("./data/bgm.mp3");
}

function setup() {
  createCanvas(400, 600);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  device = createRadio();
  device.option("PC");
  device.option("mobile");
  device.selected("PC");

  input = new Input();
  gameState = "opening"
}


function draw() {
  background(250);
  input.update();
  if (gameState == "playing") {
    updateGame();
    drawGame();
    frameCnt++;
  } else if (gameState == "gameover") {
    if (gameoverCnt > 30) setShake(0);
    if (gameoverCnt > 40 && input.isJustPressed()) resetGame();
    gameoverCnt++;
    drawGame();
    drawGameoverScreen();
  } else if (gameState == "opening") {
    drawOpeningScreen();
  }
}

class Input {
  constructor() {
    this.current = false;
    this.prev = false;
  }

  update() {
    this.prev = this.current;
    if (mouseIsPressed || keyIsPressed) this.current = true;
    else this.current = false;
  }

  isJustPressed() {
    return this.prev == false && this.current == true;
  }

  isPressed() {
    return this.prev == true && this.current == true;
  }

  isReleased() {
    return this.prev == true && this.current == false;
  }

  diff() {
    return { x: mouseX - pmouseX, y: mouseY - pmouseY };
  }

  keyArrow() {
    return {
      left: keyIsDown(LEFT_ARROW) * -1,
      right: keyIsDown(RIGHT_ARROW),
      up: keyIsDown(UP_ARROW) * -1,
      down: keyIsDown(DOWN_ARROW),
    };
  }
}
