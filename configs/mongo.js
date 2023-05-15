'use strict'

const mongoose = require('mongoose');

exports.connect = async(req, res)=>{
  try{
    const uriMongo = `${process.env.URI_MONGO}`;
    mongoose.set('strictQuery', false);
    await mongoose.connect(uriMongo);
    return console.log('Connected to db')
  }catch(err){
    console.log(err);
  }
}