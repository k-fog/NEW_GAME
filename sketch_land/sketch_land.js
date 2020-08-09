"use strict";

let input;
let gameState;
let player;
let ground;
let particles;
let point;
let onMountain;
let se_jump, se_te, se_gameover, bgm;

function preload() {
  se_gameover = loadSound("./data/se_gameover.mp3");
  se_jump = loadSound("./data/se_jump.mp3");
  se_te = loadSound("./data/se_te.mp3");
  bgm = loadSound("./data/bgm.mp3");
}

function setup() {
  createCanvas(800, 600);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  userStartAudio();

  input = new Input();
  resetGame();
}


function draw() {
  background(250);
  input.update();
  updateGame();
  drawGame();
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
}
