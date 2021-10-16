const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Number
})

module.exports = mongoose.model('Exercise', schema)
