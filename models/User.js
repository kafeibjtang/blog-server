const mongoose = require('mongoose')
const { encrypt, decrypt } = require('../core/util/util')
const assert = require('http-assert')
const createHttpError = require('http-errors')

const schema = new mongoose.Schema({

  username: {
    required: [true, '用户名必填'],
    index: true,
    type: String,
    validate: {
      validator(val) {
        return /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!.#*?&]{6,12}$/.test(val)
      },
      message: "用户名必须为 数字+字母 6-8位"
    },
    //唯一
    unique: true
  },
  password: {
    type: String,
    //不指定select查询不会返回
    select: false,
    required: [true, '密码必填'],

    validate: {
      validator(val) {

        return val !== '密码格式不正确'
      },
      message: "密码必须为 数字+密码(大小写) 8-12位"
    },
    set(val, schematype) {
      let isValidate = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/.test(decrypt(val))
      if (isValidate) {
        return encrypt(val)
      }
      return '密码格式不正确'
    }
  },
  email: {
    type: String,
    validate: {
      validator: function (val) {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(val)
      },
      message: "请输入合法邮箱地址"
    },
    unique: true
  },
  avatar: {
    type: String, //URL,
  },

  nickname: {
    type: String,
    required: [true, '昵称必填'],
    validate: {
      validator: function (val) {
        return /^[0-9a-zA-Z\u0391-\uFFE5]{1,8}$/.test(val)
      },
      message: "昵称可包含 数字/英文/汉字 1-8位"
    },
    default: '用户' + ~~(Math.random() * 99999)
  },
  signature: {
    type: String,
    default: '这个人很懒, 什么都没有写 ^_^'
  }
})



module.exports = mongoose.model('User', schema)