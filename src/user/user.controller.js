'use strict'

const User = require('./user.model');
const {validateData, encryptPassword, checkPassword, deleteSensitiveData} = require('../utils/validate');
const {createToken} = require('../services/jwt');

exports.test = (req, res)=>{
  res.send({message: 'User test running', user: req.user});
}

exports.register = async(req, res)=>{
  try{
    let data = req.body;
    let params = {
      name: data.name,
      surname: data.surname,
      email: data.email,  
      password: data.password,
      carnet: data.carnet,
      grade: data.grade
    }
    let validate = validateData(params);
    if(validate) return res.status(403).send({message: validate});
    data.password = await encryptPassword(data.password);
    data.role = 'ALUMNO'
    if(data.degree) return res.send({message: 'The params degree is unsupported'})
    let newUser = new User(data);
    await newUser.save();
    return res.send({message: 'User created successfully'});
  }catch(err){
    console.log(err);
    return res.status(500).send({message: 'Error creating account'});
  }
}

exports.login = async(req, res)=>{
  try{
    let data = req.body;
    let credentials = {
      email: data.email,
      password: data.password
    }
    let validate = validateData(credentials)
    if(validate) return res.status(403).send({message: validate});
    let user = await User.findOne({email: data.email});
    if(user && await checkPassword(data.password, user.password)){
      let token = await createToken(user);
      return res.send({message: 'User logged succesfully', token})
    }
    return res.status(404).send({message: 'Invalid credentials'});
  }catch(err){
    console.log(err);
    return res.status(500).send({message: 'Error not logged'});
  }
}

exports.save = async(req, res)=>{
  try{
    let data = req.body;
    let credentials = {
      password: data.password,
      role: data.role
    } 
    let validate = validateData(credentials);
    if(validate) return res.status(403).send({message: validate})
    let role = data.role.toUpperCase();
    data.password = await encryptPassword(data.password);
    if(role != 'ALUMNO' && role != 'MAESTRO') return res.send({message: `Unsupported role`})
    if(role == 'ALUMNO'){
      let params = {
        carnet: data.carnet,
        grade: data.grade
      }
      let student = validateData(params);
      if(student) return res.status(403).send({message: student})
      if(data.degree) return res.status(403).send({message: 'Params degree is unsupported'});
      let newStudent = new User(data);
      await newStudent.save();
      return res.status(201).send({message: 'Student saved successfully'});
    }else{
      let params = {
        degree: data.degree
      }
      let teacher = validateData(params);
      if(teacher) return res.status(403).send({message: teacher})
      if(data.carnet || data.grade) return res.status(403).send({message: 'Params grade and carnet are unsupported'});
      let newTeacher = new User(data);
      await newTeacher.save();
      return res.status(201).send({message: 'Teacher saved successfully'});
    }
  }catch(err){
    console.log(err)
    return res.status(500).send({message: 'Error saving user', error: err.message});
  }
}

exports.update = async(req, res)=>{
  try{
    let userId = req.params.id;
    let account = req.user.sub;
    let user = await User.findOne({_id: userId});
    if(!user) return res.status(404).send({message: 'User not found'});
    if(user._id != account) return res.send({message: 'You can only update your account'});


    let data = req.body;
    if(data.role || data.password) return res.send({message: 'Params role and password cant be updated'});
    if(data.degree) return res.send({message: 'The params degree is unsupported'});
    let userUpdated = await User.findOneAndUpdate(
      {_id: userId},
      data,
      {new: true} 
  );
  if(!userUpdated) return res.status(404).send({message: 'User not found and not updated'});
  await deleteSensitiveData(userUpdated);
  return res.send({message: 'User updated', userUpdated});
    
  }catch(err){
      console.log(err);
      return res.status(500).send({message: 'Error updating', error: err.message});
  }
}

exports.updatePassword = async(req, res)=>{
  try{
    let userId = req.params.id;
    let account = req.user.sub;
    let user = await User.findOne({_id: userId});
    if(!user) return res.status(404).send({message: 'User not found'});
    if(user._id != account) return res.send({message: 'You can only update your account'});

    let data = req.body;
    if(!data.password) return res.send({message: 'Only password can be updated'})
    data.password = await encryptPassword(data.password);

    let userUpdated = await User.findOneAndUpdate(
      {_id: userId},
      data,
      {new: true} 
    );
    if(!userUpdated) return res.status(404).send({message: 'User not found and not updated'});
    return res.send({message: 'Password Updated', userUpdated});
  }catch(err){
      console.log(err);
      return res.status(500).send({message: 'Error updating password'});
  }
}

exports.delete = async(req, res)=>{
  try{
      let userId = req.params.id;
      let account = req.user.sub;
      let user = await User.findOne({_id: userId});
      if(!user) return res.status(404).send({message: 'User not found'});
      if(user._id != account) return res.send({message: 'You can only delete your account'});
      await User.deleteOne({_id: account});
      return res.send({message: 'Account deleted succesfully'});
  }catch(err){
      console.log(err);
      return res.status(500).send({message: 'Error removing user'});
  }
}
