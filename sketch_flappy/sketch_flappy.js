/**
 * @preserve Credits
 * 
 * "p5.js でゲーム制作" ( https://fal-works.github.io/make-games-with-p5js/ )
 * Copyright (c) 2020 FAL
 * Used under the MIT License
 * ( https://fal-works.github.io/make-games-with-p5js/docs/license/ )
 */

let player;
let blocks;
let gameState;
let frameCnt;
let bgm, se_jump, se_gameover;

function preload() {
  bgm = loadSound("./data/nc221261.mp3");
  se_jump = loadSound("./data/se_jump.mp3");
  se_gameover = loadSound("./data/se_gameover.mp3");
}

function setup() {
  createCanvas(800, 600);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  userStartAudio();

  resetGame();
}

function draw() {
  updateGame();
  drawGame();
}

function mousePressed() {
  onInput();
}

function keyPressed() {
  onInput();
}
