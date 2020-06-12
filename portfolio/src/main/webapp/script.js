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
  const commentLimit = document.getElementById("comment-limit").value;
  const languageCode = document.getElementById('language').value;

  if (commentLimit < 0) {
    alert("Max number of comments must be at least 0");
  } else {
    fetch('/data?limit=' + commentLimit + '&languageCode=' + languageCode).then(response => response.json()).then((commentList) => {
      const listElement = document.getElementById('comments');
      listElement.innerHTML = "";
      commentList.forEach(commentObject => listElement.appendChild(createListElement(commentObject)));
    });
  }
}

const BEAMING_FACE = "&#128513";
const SMILING_FACE = "&#128578";
const NEUTRAL_FACE = "&#128528";
const FROWNING_FACE = "&#128577";
const CRYING_FACE = "&#128546";

/** Creates an <li> element containing text and a checkbox for deletion. */
function createListElement(commentObject) {
  const commentElement = commentObject.comment;

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

  if (!commentObject.delete) {
    deleteCheckboxElement.disabled = true;
    checkmarkElement.className = 'disabled-checkmark';
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
  fetch('/delete-data', {method: 'POST', body: params}).then(response => response.json()).then((message) => {
    if (message.deleteStatus) {
      getComments();
    } else {
      alert("Error deleting comment");
    }
  });
}

function postComment() {
  const name = document.getElementById('name-entry');
  const comment = document.getElementById('comment-entry');

  const params = new URLSearchParams();
  params.append('name-input', name.value);
  params.append('comment-input', comment.value);
  fetch('/data', {method: 'POST', body: params}).then(response => response.json()).then((message) => {
    if (message.error == null) {
      getComments();

      // show user that comment was posted
      window.scrollTo(0,0);
      name.value = "";
      comment.value = "";
    } else {
      alert(message.error);
    }
  });
}

/**
  * Checks with server if user has logged in.
  * Display corresponding text and url in login section if login is true/false.
  */
function getLoginStatus() {
  fetch('/user').then(response => response.json()).then((userInfo) => {
    const loginStatusElement = document.getElementById('login-section');
    loginStatusElement.innerHTML = "";

    const commentSectionElement = document.getElementById("new-comment-section");

    if (userInfo.isLoggedIn) {
      const logoutElement = document.createElement('a');
      logoutElement.innerHTML = "Logout";
      logoutElement.href = userInfo.logoutUrl;
      logoutElement.className = "comment-button";

      const emailElement = document.createElement('p');
      emailElement.innerHTML = "Welcome, <strong>" + userInfo.email + "</strong>! Now you can post and delete comments!";
      emailElement.className = "login-section-text";

      loginStatusElement.appendChild(logoutElement);
      loginStatusElement.appendChild(emailElement);

      commentSectionElement.style.display = "block";
      
    } else {
      const loginElement = document.createElement('a');
      loginElement.innerHTML = "Login";
      loginElement.href = userInfo.loginUrl;
      loginElement.className = "comment-button";

      const textElement = document.createElement('p');
      textElement.innerHTML = "Sign in to post and delete comments!";
      textElement.className = "login-section-text";

      loginStatusElement.appendChild(loginElement);
      loginStatusElement.appendChild(textElement);

      commentSectionElement.style.display = "none";
    }

    getComments();
  });

}
