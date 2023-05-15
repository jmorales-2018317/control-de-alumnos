'use strict'

const jwt = require('jsonwebtoken');

exports.ensureAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: `Doesn't contain headers AUTHORIZATION` });
  } else {
    try {
      let token = req.headers.authorization.replace(/['"]+/g, '')
      var payload = jwt.decode(token, `${process.env.SECRET_KEY}`);
      if (Math.floor(Date.now() / 1000) >= payload.exp) {
        return res.status(401).send({ message: 'Expired token' });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send({ message: 'Invalid token' });
    }
    req.user = payload;
    next();
  }
}

exports.isTeacher = async (req, res, next) => {
  try {
    let user = req.user;
    if (user.role != 'MAESTRO') return res.status(403).send({ message: 'Access denied' });
    next();
  } catch (err) {
    console.log(err);
    return res.send({ message: 'Access denied' });
  }
}

exports.isStudent = async(req, res, next)=>{
  try{
    let user = req.user;
    if(user.role != 'ALUMNO') return res.status(403).send({message: 'Access denied'});
    next()
  }catch(err){
    console.log(err);
    return res.send({message: 'Access denied'});
  }
}