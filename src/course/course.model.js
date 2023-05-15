'use strict'

const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    description: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    student:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
})

module.exports = mongoose.model('Course', courseSchema);