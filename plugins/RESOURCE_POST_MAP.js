module.exports = {
  "Article": {
    "body": function (body, _id) {
      return {
        ...body,
        author: _id
      }
    }
  },
  "Column": {
    "body": function (body, _id) {
      return {
        ...body,
        uid: _id
      }
    }
  },
  "Comment": {
    "body": function (body, _id) {
      return {
        ...body,
        uid: _id
      }
    }
  }
}
// 641bc926c9178e46481b1f12