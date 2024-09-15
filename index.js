//import express module
const express = require('express');
const mongoose = require("mongoose");
const authRouter = require ('./routes/auth');
require('dotenv').config();


// define the server port
    const PORT=3001;

    //create an instance of an express application
    //because it give us starting point 
    const app = express();
    //mongodb string
    const DB = "mongodb+srv://agbekponouv:Vignon1999@cluster0.lcotb.mongodb.net/"
    //midlleware to register route or to mount route
    app.use(express.json());
   app.use(authRouter);

    mongoose.connect(DB).then(()=>{
    console.log('mongodb connected');
   });
    // start the server and specified the port 
    app.listen(PORT,"0.0.0.0",function(){
        //log the number 
        console.log (`server is running on port ${PORT}`);
    } )
