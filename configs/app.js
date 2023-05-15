'use strict'

const express = require('express');
const app = express();
const port = process.env.PORT || 3200;
const userRoutes = require('../src/user/user.routes');
const courseRoutes = require('../src/course/course.routes');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use('/user', userRoutes);
app.use('/course', courseRoutes);

exports.initServer = ()=>{
  app.listen(port);
  console.log(`Server http running in port ${port}`);
}