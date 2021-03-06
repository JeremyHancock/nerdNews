var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the nerdist website
app.get("/api/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://nerdist.com/categories/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every a tag within an element with a .loop-wrapper class, and do the following:
    $(".loop-wrapper a").each(function (i, element) {
      // Save an empty result object
      var result = {};
      // Save the article title
      result.title = $(this)
        .find("span")
        .text();
      // Save the link to the article
      result.link = $(this)
        .attr("href");
      // Save the link to the image
      result.image = $(this)
        .find(".grid_image")
        .attr("data-1x1");
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/api/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all Comments from the db
app.get("/api/comments", function (req, res) {
  // Grab every document in the Comments collection
  db.Comment.find({})
    .then(function (dbComment) {
      // If we were able to successfully find Comments, send them back to the client
      res.json(dbComment);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id
app.get("/api/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// Route for grabbing a specific Comment by articleId
app.get("/api/comments/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Comment.find({ articleId: req.params.id })
    // ..and populate all of the comments associated with it
    .then(function (dbComment) {
      // If we were able to successfully find a Comment with the given id, send it back to the client
      res.json(dbComment);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving a Comment
app.post("/api/comments/:id", function (req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function (dbComment) {
      return db.Article.findOneAndUpdate({ "_id": req.params.id }, { commentId: dbComment._id }, { new: true })
        .then(function (dbArticle) {
          // If we were able to successfully update an Article, send it back to the client
          res.json(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
});
app.delete('/api/comments/:id', function (req, res) {
  var id = req.param("id");
  db.Comment.remove({ _id: id },
    function (err) {
      if (err) {
        console.log(err)
      }

    });
});
// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});