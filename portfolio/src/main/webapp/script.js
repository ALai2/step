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

  if(keyPr == RIGHT_KEY && x[0] <= canvas.width - 20 - STEP_SNAKE) { 
    x[0] = x[0] + STEP_SNAKE;
  } else if(keyPr == LEFT_KEY && x[0] > -10 + STEP_SNAKE) {
    x[0] = x[0] - STEP_SNAKE; 
  } else if(keyPr == UP_KEY && y[0] > -10 + STEP_SNAKE) {
    y[0] = y[0] - STEP_SNAKE; 
  } else if(keyPr == DOWN_KEY && y[0] <= canvas.height - 20 - STEP_SNAKE) {
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

/**
 * Fetches comments from server and places it into message-container
 */
function getComments() {
  const commentLimit = document.getElementById("comment-limit").value;
  const languageCode = document.getElementById('language').value;

  if (commentLimit < 0) {
    alert("Max number of comments must be at least 0");
  } else {
    fetch('/data?limit=' + commentLimit + '&languageCode=' + languageCode).then(response => response.json()).then((comments) => {
      if (comments.error == null) {
        const listElement = document.getElementById('comments');
        listElement.innerHTML = "";
        comments.forEach(comment => listElement.appendChild(createListElement(comment)));
      } else {
        alert(comments.error);
      }
    });
  }
}

const BEAMING_FACE = "&#128513";
const SMILING_FACE = "&#128578";
const NEUTRAL_FACE = "&#128528";
const FROWNING_FACE = "&#128577";
const CRYING_FACE = "&#128546";

/** Creates an <li> element containing text and a checkbox for deletion. */
function createListElement(commentElement) {
  const liElement = document.createElement('label');
  liElement.innerHTML = commentElement.name + " says: " + commentElement.comment;
  liElement.className = 'comment';

  const deleteCheckboxElement = document.createElement('input');
  deleteCheckboxElement.type = "checkbox";
  deleteCheckboxElement.name = "checkbox";
  deleteCheckboxElement.value = commentElement.id;

  const checkmarkElement = document.createElement('span');
  checkmarkElement.className = 'checkmark';

  const sentimentElement = document.createElement('span');
  sentimentElement.className = 'sentiment';
  const score = commentElement.score;
  if (score < -0.6) {
    sentimentElement.innerHTML = CRYING_FACE;
  } else if (score < -0.2) {
    sentimentElement.innerHTML = FROWNING_FACE;
  } else if (score < 0.2) {
    sentimentElement.innerHTML = NEUTRAL_FACE;
  } else if (score < 0.6) {
    sentimentElement.innerHTML = SMILING_FACE;
  } else {
    sentimentElement.innerHTML = BEAMING_FACE;
  }
  
  liElement.appendChild(deleteCheckboxElement);
  liElement.appendChild(checkmarkElement);
  liElement.appendChild(sentimentElement);
  return liElement;
}

/** Delete every single comment with a checked checkbox */
function deleteComments() {
  // get all list elements with a checked checkbox
  const checkedcheckboxes = document.querySelectorAll('input[name="checkbox"]:checked');
  
  checkedcheckboxes.forEach((checkbox) => {
    deleteSingleComment(checkbox);
  });
}

/** Delete comment by sending comment id with post request to server */
function deleteSingleComment(checkbox) {
  const params = new URLSearchParams();
  params.append('id', checkbox.value);
  fetch('/delete-data', {method: 'POST', body: params}).then(() => {
    getComments();
  });
}

function postComment() {
  const name = document.getElementById('name-entry').value;
  const comment = document.getElementById('comment-entry').value;

  const params = new URLSearchParams();
  params.append('name-input', name);
  params.append('comment-input', comment);
  fetch('/data', {method: 'POST', body: params}).then(response => response.json()).then((message) => {
    if (message.error == null) {
      getComments();
    } else {
      alert(message.error);
    }
  });
}
