'use strict'

const express = require('express');
const api = express.Router();
const courseController = require('./course.controller');
const {ensureAuth, isTeacher, isStudent} = require('../services/autenticated')

api.get('/', courseController.test);

api.post('/assign/:id', [ensureAuth, isStudent], courseController.assign);
api.get('/get', [ensureAuth, isStudent], courseController.get);

api.post('/save', [ensureAuth, isTeacher], courseController.save);
api.put('/update/:id', [ensureAuth, isTeacher], courseController.update);
api.delete('/delete/:id', [ensureAuth, isTeacher], courseController.delete);
api.get('/getPersonalCourses', [ensureAuth, isTeacher], courseController.getPersonalCourses);

module.exports = api;