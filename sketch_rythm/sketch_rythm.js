"use strict";

let input;
let gameState;
let entities;
let entities_2;
let frameCnt;
let gameoverCnt;
let shakeMagnitude;
let shakeDampingFactor;
let se_shot, se_gameover, bgm;

function preload() {
}

function setup() {
  createCanvas(800, 600);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  input = new Input();
  gameState = "opening"
}


function draw() {
  background(250);
  input.update();
  if (gameState == "opening") {
    drawOpeningScreen();
  } else if (gameState == "playing") {
    updateGame();
    drawGame();
    frameCnt++;
  } else if (gameState == "gameover") {
    setShake(0);
    if (gameoverCnt > 40 && input.isJustPressed()) resetGame();
    gameoverCnt++;
    drawGame();
    drawGameoverScreen();
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