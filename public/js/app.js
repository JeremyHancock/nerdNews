// Grab the articles as a json
$.getJSON("/api/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").prepend("<a href='" + data[i].link + "' target='_blank'> <img src='" + data[i].image + "'></a></p>");
    $("#articles").prepend("<p data-id='" + data[i]._id + "'>" + data[i].title + "</p>");
  }
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function () {
  // Empty the notes from the note section
  $("#comments").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/api/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      // The title of the article
      $("#comments").append("<p>" + data.title + "</p>");
      // An input to enter a author
      $("#comments").append("<input id='authorinput' name='author' placeholder='Your name'>");
      // A textarea to add a new note body
      $("#comments").append("<textarea id='bodyinput' name='body' placeholder='Your comment'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#comments").append("<button data-id='" + data._id + "' id='saveComment'>Save Comment</button>");
    })
  // If there's a comment attached to the article
  $.ajax({
    method: "GET",
    url: "/api/comments/" + thisId
  })
    .then(function (data) {
      console.log(data);
for (i=0; i<data.length; i++){
  var parseTimestamp = data[i].timestamp;
  var commentTime = 
        // Using the timestamp of the comment ...
      $("#pastComments").append("<p> At " + data[i].timestamp + " " + data[i].author + " said ... <p>")
      // Place the body of the note in the body textarea
      $("#pastComments").append("<p>" + data[i].body + "</p>");
      $("#pastComments").append("<p> -----------------------------------------</p>")
    }
  });
  });

// When you click the saveComment button
$(document).on("click", "#saveComment", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  // Run a POST request to create the comment, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/api/comments/" + thisId,
    data: {
      // Value taken from data-id
      articleId: thisId,
      // Value taken from authorinput
      author: $("#authorinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),
      // Attach the current time
      timestamp: Date.now()
    }
  })
    // With that done
    .then(function (data) {
      console.log(data);
      // Empty the notes section
      $("#comments").empty();
      $("#pastComments").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#authorinput").val("");
  $("#bodyinput").val("");

});
