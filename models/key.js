const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now
  },
})

module.exports = mongoose.model('key', schema)