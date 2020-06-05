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

const size = 30;
var canvas;
var ctx;
var x = new Array(5);
var y = new Array(5);

function initSnake() {
  canvas = document.getElementById('snakeCanvas'); // Get the canvas element by Id
  ctx = canvas.getContext('2d'); // Canvas 2d rendering context
  for (var z=0; z < 5; z++) {
    x[z] = 10;
    y[z] = 10;
  }
  drawSnake();
}
	
function drawSnake() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (var z=0; z<5; z++) {
    ctx.beginPath();
    ctx.rect(x[z], y[z], size, size);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
  }
}

const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;

//move snake inside the canvas using arrow keys
window.onkeydown = function(event) {
  for (var z = 4; z > 0; z--) {
    x[z] = x[(z - 1)];
    y[z] = y[(z - 1)];
  }
  
  var keyPr = event.keyCode; //Key code of key pressed
  
  if(keyPr == RIGHT_KEY && x[0]<=canvas.width - 40) { 
    x[0] = x[0]+20;
  }
  else if(keyPr == LEFT_KEY && x[0]>10) {
    x[0] = x[0]-20; 
  }
  else if(keyPr == UP_KEY && y[0]>10) {
    y[0] = y[0]-20; 
  }
  else if(keyPr == DOWN_KEY && y[0]<=canvas.height - 40) {
    y[0] = y[0]+20; 
  }
  
  //Drawing snake at new position
  drawSnake();
};