const express = require('express');
const router = express.Router();
const user = require("../core/users")
const { getUserStatusMsg } = require("../core/statusMap")
const { getPubliKeySync } = require("../core/rsa")
const expressjwt = require('express-jwt')
const createError = require("http-errors")

router.post('/', expressjwt({
  secret: getPubliKeySync(),
  algorithms: ["RS256"],
  isRevoked: function (req, payload, next) {

    let { user_name, user_id } = payload
    req.username = user_name
    req.userID = user_id

    user.verifyToken(user_name, user_id).then(result => {
      if (result.code === getUserStatusMsg('USER_FOND')['code']) {
        next()
      } else {
        next(createError(401))
      }
    })

  }
}), async (req, res, next) => {
  let result = getUserStatusMsg('USER_LOGIN')
  result.statusCode = 200
  res.send(200, {
    ...result,
  })
});

module.exports = router;