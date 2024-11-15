const UserModel = require('../models/UsersModel.js')
const songModel = require('../models/songsModel.js')
const Emails = require('../mails/email.js')
const path = require('path');
const bcrypt=require("bcryptjs")
const dotenv=require('dotenv').config()
const jwt=require("jsonwebtoken");
const { error } = require('console');
const Jwt_Secret="thisisseceret";
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

var savedOTPS = {

};

const login = async(req, res) => {
    try{
        if(req.body){
            let token
            const {email, password} = req.body;
            const user = await UserModel.findByEmail(email)
            if(user){
                console.log("Login user -> ", user)
                const isMatch = await bcrypt.compare(password, user.password)
                if(!isMatch){
                    console.log('Entered Wrong Password!')
                    res.status(300).send({error: "Incorrect Password"})
                    return 0
                }

                if(user.isBlocked){
                    console.log('User account Blocked!')
                    res.status(300).send({error: "Your account has been restricted by an admin!"})
                    return 0
                }

                if(req.query){
                    token = await user.genAuthToken("7 days")
                } else {
                    token = await user.genAuthToken("30 min")
                }
                
                res.status(201).send({success : "Login success", token : token, user : user})
              
                return 0
            }
            res.status(404).send({error : "Incorrect Email"})
        }
    } catch (err) {
        console.log("Error in while login : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}


const register = async(req,res) => {
  //  console.log(req.body)
    try{
        if(!req.body){
            console.log('Error in creating user account')
            res.status(500).send({error: "Something went wrong in server!"})
            return 0
        }
        
        let user = new UserModel(req.body)
        if(req.file.path) user.profileUrl = req.file.path
        await user.save()
        
        if(user){
            console.log("User account created successfully!")
            res.status(201).send({success : "Registered Successfully!"})
            return 0
        }
        console.log("Error while creating account")
    } catch (err) {
        console.log("Error in while creating account : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}


const generateOTP = async (req,res) => {
    try{
        const email = req.body.email
        console.log(email, req.body)
        let randomdigit = Math.floor(100000 + Math.random() * 900000);
        await Emails.sendOTP(email, randomdigit)
        savedOTPS[email] = randomdigit;
        setTimeout(() => {
            delete savedOTPS[`${email}`];
        }, 180000);
        console.log(savedOTPS);
        res.status(200).send({success: `OTP sent to ${email}`})
    } catch (err) {
        console.log("Error in while sending otp : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}

const checkOTP = async (req,res) => {
    try{
        const {OTP, email} = req.body
        if (savedOTPS[email] && savedOTPS[email].toString() === OTP.toString()) {
            res.status(200).send({success : "Mail Verified"})
            delete savedOTPS[email];
          } else {
            res.status(300).send({error: "Wrong otp!"})
          }

    } catch (err) {
        console.log("Error in while checking OTP : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}

const resetPasswordRequest = async(req,res) => {
    const email = req.body.email
    try{
        const user = await UserModel.findByEmail(email)
        const secret=Jwt_Secret + user.password
        const payload={
            email:user.email,
            id:user.id
        }
        const token=jwt.sign(payload,secret,{expiresIn:'30m'})
        //console.log(token);
        const encrypt = btoa(`id=${user.id}&token=${token}`)
        const link=`http://${process.env.IP}:${process.env.PORT || 4040}/resetpassword.html?${encrypt}`
        console.log(link);
        await Emails.sendResetLink(email,link)
        res.status(200).send({success:"Password reset link sent to mail id"})
    }
    catch(err){
        console.log("Error in while requesting reset password : ",err)
        res.status(500).send({error:"Unable to reset password"})
    }
}

const changePassword = async(req,res) => {

    const { id, token } = req.query
    const password = req.body.password

    try {
        const user = await UserModel.findUserById(id)
        const secret=Jwt_Secret + user.password
        const payload=jwt.verify(token,secret)
        user.password=password
        await user.save()
        res.status(200).send({success:"Password changed successfully"})
    } catch (err) {
        console.log("Error in while changing password : ",err)
        res.status(400).send({error: "Unable to change password, Please try again later"})
    }
}

const getSongs = async (req,res) => {
    try{
        const songs = await songModel.find()
        if(songs){
            res.status(200).send({success: true, songs: songs})
        } else {
            res.status(200).send({success: false, empty: "No songs found"})
        }
    } catch (err) {
        console.log("Error while fetching songs :", err)
        res.status(300).send({error : "Something went wrong with server"})
    }
}

module.exports = {
    login,
    register,
    generateOTP,
    checkOTP,
    resetPasswordRequest,
    changePassword,
    getSongs
}
