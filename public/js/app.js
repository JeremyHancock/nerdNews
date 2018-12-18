// Grab the articles as a json
$.getJSON("/api/articles", function (data) {
  var unique = [];
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Check for unique articles
    var name = data[i].title;
    if (!(unique.includes(name))) {
      unique.push(name);

      // Display the information on the page
      var html = `<div class="card align-items-center"> <p id="title" data-id="${data[i]._id}">${data[i].title}</p>
    <a href="${data[i].link}" target="_blank">
      <img src="${data[i].image}">
    </a></div>`;
      $("#articles").prepend(html);
    }
  }
});
// Scrape the site on page load
$(document).ready(function () {
  $.ajax({
    method: "GET",
    url: "/api/scrape/"
  })
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
      var html = `<p>"${data.title}"</p>
      <div class="card">
      <input id="authorinput" name="author" placeholder="Your name">
      <textarea id="bodyinput" name="body" placeholder="Your comment"></textarea><br>
      <button data-id="${data._id}" id="saveComment">Save Comment</button></div>`
      $("#comments").append(html);
    })
  // Get any existing comments that are associated with the article
  $.ajax({
    method: "GET",
    url: "/api/comments/" + thisId
  })
    .then(function (data) {
      $("#pastComments").empty();

      // Place the body of the note in the body textarea

      for (i = 0; i < data.length; i++) {
        var html = `<p> At "${data[i].timestamp} ${data[i].author} said ... </p>
        <p>${data[i].body}</p> <button data-id="${data[i]._id}" id="deleteComment">Delete</button>`
        $("#pastComments").append(html);
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
      // Empty the notes section
      $("#comments").empty();
      $("#pastComments").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#authorinput").val("");
  $("#bodyinput").val("");
});

// When you click the deleteComment button
$(document).on("click", "#deleteComment", function () {
  // Grab the id associated with the comment from the delete button
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  $.ajax({
    method: "DELETE",
    url: "/api/comments/" + thisId
  });
  // Empty the notes section
  $("#comments").empty();
  $("#pastComments").empty();
});

