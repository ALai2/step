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
 * Fetches comments from server and places it into message-container
 */
function getComments() {
  var commentLimit = document.getElementById("commentLimit").value;
  if (commentLimit < 0) {
    alert("Max number of comments must be at least 0");
  } else {
    fetch('/data?limit=' + commentLimit).then(response => response.json()).then((comments) => {
      const listElement = document.getElementById('comments');
      listElement.innerHTML = "";
      comments.forEach(comment => listElement.appendChild(createListElement(comment)));
    });
  }
}

/** Creates an <li> element containing text and a checkbox for deletion. */
function createListElement(commentElement) {
  const liElement = document.createElement('li');
  liElement.className = 'comment';

  const titleElement = document.createElement('span');
  titleElement.innerText = commentElement.name + " says: " + commentElement.comment;

  const deleteCheckboxElement = document.createElement('input');
  deleteCheckboxElement.type = "checkbox";
  deleteCheckboxElement.value = commentElement.id;

  liElement.appendChild(titleElement);
  liElement.appendChild(deleteCheckboxElement);
  return liElement;
}

/** Delete every single comment with a checked checkbox */
function deleteComments() {
  const listComments = document.getElementById('comments').children;
  const arrayComments = Array.from(listComments);

  arrayComments.forEach((comment) => {
    const commentElements = Array.from(comment.children);
    if (commentElements[1].checked == true) {
      deleteSingleComment(comment, commentElements[1].value);
    }
  });
}

/** Delete comment by sending comment id with post request to server */
function deleteSingleComment(comment, commentId) {
  const params = new URLSearchParams();
  params.append('id', commentId);
  fetch('/delete-data', {method: 'POST', body: params}).then(() => {
    comment.remove();
  });
}