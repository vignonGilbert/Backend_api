const express = require("express");
const User = require('../models/user');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const authRouter = express.Router();

authRouter.post('/api/signup',async(req,res)=>{
    try{
       const {fullName, email, password} = req.body;
     const existingEmail = await  User.findOne({email});
     if(existingEmail){
        return res.status(400).json({msg:"user with same email already exist"});
     }else{
      //generate a salt with a cost factor of ten
      const salt = await bcrypt.genSalt(10);
      //hash the password 
      const hashedPassword = await bcrypt.hash(password,salt);

       let user =  new User({fullName, email,password:hashedPassword});
      user = await user.save();
      res.json({user});
     }

    }catch(e){
        res.status(500).json({error:e.message});

    }
});


// signin api endpoint

authRouter.post('/api/signin', async(req, res)=>{
  try{
    const {email,password}= req.body;
    const findUser = await User.findOne({email});
    if(!findUser){
      return res.status(400).json({msg:"User not found with this email"});
    }else{
     const isMatch =  await bcrypt.compare(password, findUser.password);
     if(!isMatch){
      return res.status(400).json({msg:"Incorrect Password"});
     }else{
      const token = jwt.sign({id:findUser._id},"PasswordKey");
      //remove sensitive information
      const {password, ...userWithoutPassword} = findUser._doc;
      //send response
      res.json({token,userWithoutPassword})

     }
    }

  }catch(error){
    res.status(500).json({error:e.message});

  }
});

authRouter.post('/api/google',async(req, res, next) =>{
  try{
     const findUser = await User.findOne({email:req.body.email})
     //if user existe signin
     if(findUser){
      const token = jwt.sign({id:findUser._id},process.env.JWT_SECRET);
      const{password:pass, ...rest} = findUser._doc;
      res
       .cookie('access_token', token,{httpOnly:true})
       .status(200)
       .json(rest);
     }else{
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
      const newUser = new User({
          username:req.body.fullName.split("").join("").toLowerCase()+Math.random().toString(36).slice(-4), 
          email:req.body.email,
          password:hashedPassword,
          
          });
          await newUser.save();
          const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET);
          const{password:pass, ...rest} = newUser._doc;
          res
          .cookie('access_token', token,{httpOnly:true})
          .status(200)
          .json(rest);
     }
  }catch(error){
      next(error)
  }
});




module.exports = authRouter;