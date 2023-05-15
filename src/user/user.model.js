'use strict'

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    uppercase: true
  },
  carnet: {
    type: Number,
    index: true,
    sparse: true,
    unique: true,
  },
  grade: {
    type: String,
  },
  degree: {
    type: String,
  }
});

module.exports = mongoose.model('User', userSchema);