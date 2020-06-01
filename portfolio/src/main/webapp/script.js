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
      ['I have a twin sister.', 'I have arachnophobia.', 'My high school graduating class had only 60 people.',
      'My favorite color is green.', 'Hufflepuff is the best!', 'My hidden talent is gaming.',
      "Most of my friends aren't CS majors.", 'I played tennis in high school.'];

  // Pick a random fact.
  const fact = facts[Math.floor(Math.random() * facts.length)];

  // Add it to the page.
  const factContainer = document.getElementById('fact-container');
  factContainer.innerText = fact; 
}

/**
 * Fetches a random message from java servlet and places it into message-container
 */
function getRandomMessage() {
  fetch('/data').then(response => response.json()).then((message) => {
    const listElement = document.getElementById('message-container');
    listElement.innerHTML = "";
    
    message.forEach(element => listElement.appendChild(createListElement(element)));
    
  });
}

/** Creates an <li> element containing text. */
function createListElement(text) {
  const liElement = document.createElement('li');
  liElement.innerText = text;
  return liElement;
}