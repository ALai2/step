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

package com.google.sps.servlets;

import com.google.sps.data.Comment;
import com.google.gson.Gson;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;

import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import com.google.cloud.translate.TranslateException;

import com.google.cloud.language.v1.Document;
import com.google.cloud.language.v1.LanguageServiceClient;
import com.google.cloud.language.v1.Sentiment;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import org.json.simple.JSONObject;

/** Servlet that returns and saves comments in Datastore */
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    int commentLimit = Integer.parseInt(request.getParameter("limit"));
    String languageCode = request.getParameter("languageCode");

    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);
    List<Entity> queryList = results.asList(FetchOptions.Builder.withLimit(commentLimit));

    Translate translate = translate = TranslateOptions.getDefaultInstance().getService();

    UserService userService = UserServiceFactory.getUserService();
    String currentUser = "";
    if (userService.isUserLoggedIn()) {
      currentUser = userService.getCurrentUser().getEmail();
    } 

    try {
      ArrayList<JSONObject> commentList = new ArrayList<JSONObject>();
      for (Entity entity : queryList) {
        long id = entity.getKey().getId();
        String name = (String) entity.getProperty("name");
        String comment = (String) entity.getProperty("comment");
        long timestamp = (long) entity.getProperty("timestamp");
        double score = (double) entity.getProperty("score");
        String userEmail = (String) entity.getProperty("userEmail");

        // Do the translation.
        if (!languageCode.equals("original")) {
          Translation translation = translate.translate(comment, Translate.TranslateOption.targetLanguage(languageCode));
          comment = translation.getTranslatedText();
        }
      
        Comment commentObject = new Comment(id, name, comment, timestamp, score, userEmail);
      
        JSONObject commentJson = new JSONObject();
        commentJson.put("comment", commentObject);
        if (currentUser.equals(userEmail)) {
          commentJson.put("delete", true);
        } else {
          commentJson.put("delete", false);
        }

        commentList.add(commentJson);
      }
      
      Gson gson = new Gson();   
      String json = gson.toJson(commentList);
      response.setContentType("application/json; charset=utf-8");
      response.getWriter().println(json);

    } catch (TranslateException error) {
      String errorMessage = "Error translating message";
      JSONObject responseMap = new JSONObject();
      responseMap.put("error", errorMessage);
      
      Gson gson = new Gson();   
      String json = gson.toJson(errorMap);
      response.setContentType("application");
      response.getWriter().println(json);
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    JSONObject responseMap = new JSONObject();
    
    UserService userService = UserServiceFactory.getUserService();
    if (!userService.isUserLoggedIn()) {
      String errorMessage = "User needs to login to post comment";
      responseMap.put("error", errorMessage);
    } else {
      String userEmail = userService.getCurrentUser().getEmail();

      // Get the input from the form.
      String name = request.getParameter("name-input");
      String comment = request.getParameter("comment-input");
      long timestamp = System.currentTimeMillis();

      try {
        Document doc = Document.newBuilder().setContent(comment).setType(Document.Type.PLAIN_TEXT).build();
        LanguageServiceClient languageService = LanguageServiceClient.create();
        Sentiment sentiment = languageService.analyzeSentiment(doc).getDocumentSentiment();
        double score = sentiment.getScore();
        languageService.close();

        Entity commentEntity = new Entity("Comment");
        commentEntity.setProperty("name", name);
        commentEntity.setProperty("comment", comment);
        commentEntity.setProperty("timestamp", timestamp);
        commentEntity.setProperty("score", score);
        commentEntity.setProperty("userEmail", userEmail);

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.put(commentEntity);

      } catch (Exception error) {
        String errorMessage = "Error analyzing sentiment";
        responseMap.put("error", errorMessage);
      }
    }
    
    Gson gson = new Gson();   
    String json = gson.toJson(responseMap);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }
}
