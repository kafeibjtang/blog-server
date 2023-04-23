const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
module.exports = {
  "Article": {
    "revisable": ["title", "cover", "content"],
    "authField": "author"
  },
  "User": {
    "revisable": ["password", "email", "nickname"],
    "authField": "_id"
  },
  "Comment": {
    "revisable": ["content"],
    "authField": "uid"
  },
  "Column": {
    "revisable": ["name"],
    "authField": "uid"
  }
}

