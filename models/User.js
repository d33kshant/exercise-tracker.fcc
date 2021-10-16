const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
  username: String
})

module.exports = mongoose.model('User', schema)
