'use strict'

const bcrypt = require('bcrypt');

exports.validateData = (data)=>{
  try{
    let keys = Object.keys(data), msg='';
    for(let key of keys){
      if(data[key] != null && data[key] != undefined && data[key] != '') continue
      msg+=`The params ${key} is required \n`;
    }
    return msg.trim();
  }catch(err){
    console.log(err)
    return err;
  }
}

exports.encryptPassword = async (password)=>{
  try{
    return bcrypt.hashSync(password, 10);
  }catch(err){
    console.log(err)
    return err;
  }
}

exports.checkPassword = async(password, hash)=>{
  try{
    return await bcrypt.compare(password, hash);
  }catch(err){
    console.log(err);
    return err;
  }
}

exports.deleteSensitiveData = (user)=>{
  try{
    delete user.password;
  }catch(err){
    return err;
  }
}