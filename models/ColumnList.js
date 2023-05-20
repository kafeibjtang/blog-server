const mongoose = require('mongoose')
const schema = new mongoose.Schema({

})
schema.set('toJSON', { getters: true })
module.exports = mongoose.model('ColumnList', schema)