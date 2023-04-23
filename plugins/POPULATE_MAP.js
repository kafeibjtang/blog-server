module.exports = {
  "Article": [{
    "path": "writer",
    "select": "nickname avatar"
  },
  {
    "path": "column",
    "select": "name"
  },
  {
    "path": "comments",
    "select": "content date uid",
    "populate": {
      "path": "uid",
      "select": "nickname avatar"
    }
  }],
  "Comment": [{
    "path": "uid",
    "select": "nickname avatar"
  }],
  "User": [{
    "path": "",
    "select": "nickname avatar username email"
  }],
  "Column": [
    {
      "path": "aids",
      "select": "title content cover date hit_num comment_num like_num writer"
    }
  ]
}