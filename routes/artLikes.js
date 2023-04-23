const express = require('express');
const router = express.Router();
const Article = require('../models/Article')
const { getPubliKeySync } = require("../core/rsa")
const jwt = require("jsonwebtoken")

/*post 文章点赞 */
router.post('/:id', async (req, res, next) => {
  let token = req.headers?.authorization?.replace('Bearer', '')
  if (token) {
    let key = getPubliKeySync()
    jwt.verify(token.trim(), key, function (err, data) {
      if (err) {
        console.log(err);
        return
      }
      let userId = data._id
      if (userId) {
        req._id = userId
      }
    })
  }
  next()
}, async (req, res, next) => {
  let id = req.params.id
  let isLike = true;
  let query = {};
  if (req._id) {
    let article = await Article.findById(id);
    let likeUsers = article["like_users"]
    isLike = !(likeUsers.includes(req._id))
    query[isLike ? "$addToSet" : "$pull"] = {
      like_users: req._id
    }
  }
  query['$inc'] = {
    like_num: isLike ? 1 : -1
  }
  try {
    let result = await Article.findByIdAndUpdate(id, query)
    let likes = ++result.like_num
    res.send(200, {
      message: "点赞成功",
      data: {
        likes
      }
    })
  } catch (error) {
    next(error)
  }
})


module.exports = router;
