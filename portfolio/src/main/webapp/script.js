// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Adds a random fact to the page.
 */

function addRandomFact() {
  const facts =
      ['I have a twin sister.', 
       'I have arachnophobia.', 
       'My high school graduating class had only 60 people.',
       'My favorite color is green.', 
       'Hufflepuff is the best!', 
       'My hidden talent is gaming.',
       "Most of my friends aren't CS majors.", 
       'I played tennis in high school.'];

  // Pick a random fact.
  const fact = facts[Math.floor(Math.random() * facts.length)];

  // Add it to the page.
  const factContainer = document.getElementById('fact-container');
  factContainer.innerText = fact; 
}

const SNAKE_LENGTH = 10;
const SNAKE_SQUARE_SIZE = 30;
var x = new Array(5);
var y = new Array(5);
var prevMousePressLoc;

function getCanvasAndContext() {
  var canvas = document.getElementById('snakeCanvas'); // Get the canvas element by Id
  var ctx = canvas.getContext('2d'); // Canvas 2d rendering context
  return {
    canvas: canvas,
    ctx: ctx,
  };
}

function initSnake() {
  var values = getCanvasAndContext();
  var canvas = values.canvas;

  for (var z = 0; z < SNAKE_LENGTH; z++) {
    x[z] = canvas.width / 2;
    y[z] = canvas.height / 2;
  }
  drawSnake();
  gameLoop();
}
	
function drawSnake() {
  var values = getCanvasAndContext();
  var canvas = values.canvas;
  var ctx = values.ctx;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (var z = SNAKE_LENGTH - 1; z >= 0; z--) {
    ctx.beginPath();

    if (z == 0) {
      ctx.fillStyle = "#000000";
    } else if (z % 2 == 0) {
      ctx.fillStyle = "#ff9900";
    } else {
      ctx.fillStyle = "#ff0000";
    }
    ctx.fillRect(x[z], y[z], SNAKE_SQUARE_SIZE, SNAKE_SQUARE_SIZE);
    ctx.closePath();
  }
}

document.addEventListener('mousedown', (event) => {
  prevMousePressLoc = event.target;
});

const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;

const STEP_SNAKE = 20;

var keysPressed = new Set();

function gameLoop() {
  var values = getCanvasAndContext();
  var canvas = values.canvas;

  if (prevMousePressLoc == canvas) {
    for (var z = SNAKE_LENGTH - 1; z > 0; z--) {
      x[z] = x[(z - 1)];
      y[z] = y[(z - 1)];
    }

    keysPressed.forEach(keyPr => moveSnake(keyPr));
  
    // Drawing snake at new position
    drawSnake();
  }

  setTimeout(gameLoop, 50);
}

/** 
  * move snake inside the canvas using arrow keys
  * @param {number} keyPr The keycode of an arrow key being pressed by the user. 
  */
function moveSnake(keyPr) {
  var values = getCanvasAndContext();
  var canvas = values.canvas;

  if(keyPr == RIGHT_KEY && x[0] <= canvas.width - 40) { 
    x[0] = x[0] + STEP_SNAKE;
  } else if(keyPr == LEFT_KEY && x[0] > 10) {
    x[0] = x[0] - STEP_SNAKE; 
  } else if(keyPr == UP_KEY && y[0] > 10) {
    y[0] = y[0] - STEP_SNAKE; 
  } else if(keyPr == DOWN_KEY && y[0] <= canvas.height - 40) {
    y[0] = y[0] + STEP_SNAKE; 
  }
}

window.onkeydown = function(event) {
  var values = getCanvasAndContext();
  var canvas = values.canvas;
  if (prevMousePressLoc == canvas) {
    event.preventDefault();
    keysPressed.add(event.keyCode);
  }
};

window.onkeyup = function(event) {
  var values = getCanvasAndContext();
  var canvas = values.canvas;
  if (prevMousePressLoc == canvas) {
    keysPressed.delete(event.keyCode);
  }
};