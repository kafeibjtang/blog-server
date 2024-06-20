const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("./plugins/db")
const { maxFileSize } = require('./config')
const cors = require("cors")
const User = require('./models/User')

const expressJwt = require('express-jwt')
const { getPubliKeySync } = require('./core/rsa')

const app = express();

// require('./socket')

app.use(cors({
  "origin": true, //true 设置为 req.origin.url
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //容许跨域的请求方式
  "allowedHeaders": "x-requested-with,Authorization,token, content-type", //跨域请求头
  "preflightContinue": false, // 是否通过next() 传递options请求 给后续中间件 
  "maxAge": 1728000, //options预验结果缓存时间 20天
  "credentials": true, //携带cookie跨域
  "optionsSuccessStatus": 200 //options 请求返回状态码
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));


//中间件
const resourceMiddleware = require("./middleware/resource")
//路由
const busRoute = require('./routes/bus');
// const loginRoute = require('./routes/login');
// const registerRoute = require('./routes/register');
const adminRoute = require('./routes/admin');
const keysRoute = require('./routes/getPubKey');
const uploadRoute = require('./routes/upload')
const searchRoute = require('./routes/search')
const artLikesRoute = require('./routes/artLikes')
const userRoute = require('./routes/user')


// const getPublicKey = require('./routes/getPubKey');
// app.use('/getPublicKey', getPublicKey)

app.use(expressJwt({
  secret: getPubliKeySync(), //解密秘钥 
  algorithms: ["RS256"], //6.0.0以上版本必须设置解密算法 
  isRevoked: async (req, payload, next) => {
    let { _id } = payload
    req._id = _id
    req.isPass = true
    try {
      let result = await User.findById(_id)
      if (!result) {
        req.isPass = false
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}).unless({
  path: [
    { url: /\/api\/rest/, methods: ['GET'] },
    { url: '/api/rest/keys', methods: ['GET'] },
    { url: '/admin/login' },
    { url: '/admin/register' },
    { url: '/keys' },
    { url: 'articles/search' },
    { url: /articles\/likes/ },
  ]
}))

//资源路由
app.use("/api/rest/:resource", resourceMiddleware(), busRoute)

//登录注册
app.use('/admin', adminRoute)

//获取公钥
app.use('/keys', keysRoute)
//文件上传
app.use('/upload', uploadRoute)
//文章搜索
app.use('/search', searchRoute)

//文章点赞
app.use('/articles/likes', artLikesRoute)
//用户信息
app.use('/userInfo', userRoute)

app.use(function (req, res, next) {
  next(createError(404));
});

const ERROR_CODE_MAP = {
  'LIMIT_FILE_SIZE': `文件大小不得超过 ${maxFileSize} bytes`
}

const ERROR_STATUS_MAP = {
  '401': "无权限操作,请先登录"
}
const QUE_MAP = {
  "username": "用户名",
  "password": "密码",
  "email": "邮箱",
  "nickname": "昵称",
  "avatar": "头像",
  "name": "文章类型"
}

app.use(function (err, req, res, next) {
  if (err.message.indexOf('duplicate key error') !== -1) {
    let repeatKey = Object.entries(err.keyPattern)?.map(([key, value]) => {
      return `${QUE_MAP?.[key]}不能重复`
    })[0]
    err.status = 422
    err.message = repeatKey
  }

  if (err.errors) {
    let paramErrors = Object.entries(err.errors).map(([key, val]) => {
      // console.log(err.errors);
      return `${val.message}`
    }).join(',')
    err.status = 422
    err.message = paramErrors
  }

  if (err.code in ERROR_CODE_MAP) {
    err.status = 422
    err.message = ERROR_CODE_MAP[err.code]
  }

  if (err.status in ERROR_STATUS_MAP) {
    err.message = ERROR_STATUS_MAP[err.status]
  }

  res.status(err.status || 500).send({
    code: err.status,
    message: err.message
  });
});


module.exports = app;
