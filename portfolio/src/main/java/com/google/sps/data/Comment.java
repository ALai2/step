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

package com.google.sps.data;

/**
 * Class representing a comment
 */
public class Comment {

  private long id;
  private String name;
  private String comment;
  private long timestamp;
  private double score;

  /**
    * @param {id} The unique id of the comment.
    * @param {name} The name of the user that the comment belongs to.
    * @param {comment} The comment that the user posts.
    * @param {timestamp} When the comment was posted.
    * @param {score} The sentiment score analyzed from the comment by google NLP API.
    *       - Valid range: [-1 to 1], -1 is most negative emotion and 1 is most positive emotion
    */
  public Comment(long id, String name, String comment, long timestamp, double score) {
    this.id = id;
    this.name = name;
    this.comment = comment; 
    this.timestamp = timestamp;
    this.score = score;
  }

}
