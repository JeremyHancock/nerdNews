var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new CommentSchema object
var CommentSchema = new Schema({
  // `author` is of type String
  author: String,
  // `body` is of type String
  body: String,
  // 'timestamp is of type Date
  timestamp: Date,
  // articleId is of type String
  articleId: String
});

// This creates our model from the above schema, using mongoose's model method
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;
