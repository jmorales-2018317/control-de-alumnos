'use strict'

const express = require('express');
const api = express.Router();
const userController = require('./user.controller');
const {ensureAuth, isTeacher, isStudent} = require('../services/autenticated');

api.get('/', userController.test)
api.post('/register', userController.register);
api.post('/login', userController.login);
api.post('/save', [ensureAuth, isTeacher], userController.save);
api.put('/update/:id', [ensureAuth, isStudent], userController.update);
api.put('/updatePassword/:id', [ensureAuth, isStudent], userController.updatePassword);
api.delete('/delete/:id', [ensureAuth, isStudent], userController.delete);

module.exports = api;