const fs = require('fs');
const path = require('path');
const UserModel = require('../models/UsersModel.js')
const AdminModel = require('../models/AdminModel.js')
const songModel = require('../models/songsModel.js')
const PlaylistModel = require('../models/PlaylistsModel.js')
const Emails = require('../mails/email.js')
const bcrypt=require("bcryptjs")
const dotenv=require('dotenv').config()
const jwt=require("jsonwebtoken")
const Jwt_Secret="thisisseceret"
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");
const time = new Date()
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// console.log(process.env.CLOUD_NAME, process.env.CLOUD_API_KEY, process.env.CLOUD_API_SECRET)

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
    
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
  folder: "music-mix"
  }
});

const uploadfile = multer({ storage: storage });

async function uploadFileToCloudinary(filePath, folder, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id,
      use_filename: true,
      unique_filename: true,
    });

    // Delete the file from local storage
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully:', filePath);
      }
    });

    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}


const upload = async (req, res) => {
  console.log("Request recieved at upload function in admin controller")
  try {
    console.log("Request received");
    console.log(req.body);

    // Paths to the uploaded files
    const mp3FilePath = path.join(__dirname, '..', '..', 'tmp_files', req.files['song'][0].filename);
    const imageFilePath = path.join(__dirname, '..', '..', 'tmp_files', req.files['image'][0].filename);
    const songData = req.body;
    const time = new Date();

    console.log("Path - ",mp3FilePath)

    // Upload song to Cloudinary
    const songURL = await uploadFileToCloudinary(mp3FilePath, 'music-mix', {
     resource_type: 'video', 
      public_id: `${req.body.name}_${time.getHours()}-${time.getMinutes()}`
    });

    // Upload image to Cloudinary
    const imageURL = await uploadFileToCloudinary(imageFilePath, 'music-mix', {
      resource_type: 'image', 
      public_id: `${req.body.name}_cover_${time.getHours()}-${time.getMinutes()}`
    });

    if(songURL && imageURL){
      console.log('Music URL:', songURL);
      console.log('Image URL:', imageURL);

      let song = new songModel(songData)
      song.songUrl = songURL
      song.imgUrl = imageURL

      await song.save();
      res.status(200).send({ success: "Uploaded" });
      return
    }
    

    
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files.' });
  }
};


const editSong = async (req, res) => {
  try {
    const songId = req.query.id;
    console.log("update song -> ",req.body)
    const { name, album, artist, year, lyrics, duration } = req.body;
    
    // Retrieve the song to be edited from the database
    const song = await songModel.findById({_id: songId});
    if (!song) {
      return res.status(404).json({ success: false, message: 'Music not found' });
    }

    // Check if files (song or image) are available in request
    let songUrl = song.songUrl; // Keep the old URL if no new file is provided
    let imageUrl = song.imgUrl; // Keep the old image URL if no new file is provided

    if (req.files && req.files.file) {
      // Upload song file to Cloudinary
      const songUpload = await uploadFileToCloudinary(req.files.file[0].path, 'music-mix',{
        resource_type: 'video', 
        public_id: `${req.body.name}_${time.getHours()}-${time.getMinutes()}`
      });
      songUrl = songUpload.secure_url;
    }

    if (req.files && req.files.image) {
      // Upload image file to Cloudinary
      const imageUpload = await uploadFileToCloudinary(req.files.image[0].path,'music-mix', {
        resource_type: 'image', 
        public_id: `${req.body.name}_cover_${time.getHours()}-${time.getMinutes()}`
      });
      imageUrl = imageUpload.secure_url;
    }

    // Update the song details in the database
    song.name = name || song.name;
    song.album = album || song.album;
    song.artist = artist || song.artist;
    song.year = year || song.year;
    song.lyrics = lyrics || song.lyrics;
    song.duration = duration || song.duration;
    song.songUrl = songUrl;
    song.imgUrl = imageUrl;
    console.log("Updated song -> ", song)
    await song.save();

    return res.status(200).json({ success: true, message: 'Music updated successfully', song });

  } catch (error) {
    console.error('Error updating song:', error);
    return res.status(500).json({ success: false, message: 'Failed to update song' });
  }
};

const deleteSong = async (req, res) => {
  try {
    const songId = req.query.id;
    console.log(songId);
    if (songId) {
      const deleteSong = await songModel.deleteOne({ _id: songId });
      console.log(deleteSong);
      if (deleteSong.deletedCount != 0) {
        await UserModel.updateMany(
          { likedSongs: songId },
          { $pull: { likedSongs: songId } } 
        );
    
        await PlaylistModel.updateMany(
          { songs: songId },
          { $pull: { songs: songId } }
        );
        res.status(200).send({ success: true, message: "Music deleted" });
      } else {
        res.status(404).send({ success: false, message: "Music not found" });
      }
    } else {
      res.status(400).send({ success: false, message: "No song ID provided" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Failed to delete song details" });
  }
};


const login = async (req,res) => {
    try{
      if(req.body){
          const {email, password} = req.body;
          const user = await AdminModel.findByEmail(email)
          if(user){
              console.log("Login user -> ", user)
              const isMatch = await bcrypt.compare(password, user.password)
              if(!isMatch){
                  console.log('Entered Wrong Password!')
                  res.status(300).send({error: "Incorrect Password"})
                  return 0
              }
              const token = user.tokens.pop()
              res.status(201).send({success : "Login success", token : token, user : user})
            
              return 0
          }
          res.status(404).send({error : "Incorrect Email"})
      }
    } catch (err) {
        console.log("Error in while login : ",err)
        res.status(500).send({error : "Incorrect Email!"})
    }
}

const register = async(req,res) => {
    console.log(req.body)
    try{
        if(!req.body){
            console.log('Error in creating admin account')
            res.status(500).send({error: "Something went wrong in server!"})
            return 0
        }
        
        let user = new AdminModel(req.body)
        await user.save()
        
        if(user){
            console.log("Admin account created successfully!")
            res.status(201).send({success : "Registered Successfully!"})
            return 0
        }
        console.log("Error while creating account")
    } catch (err) {
        console.log("Error in while creating admin account : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}

const testing = async (req,res) => {
  console.log(req.body)
  res.send({success : "Working good"});
}

const getUsers = async(req,res) => {
  try{
    const users = await UserModel.find()
    if(users){
      res.status(200).send({ success: true, users:users })
    } else {
      res.status(200).send({ success: false, users: "No users to show" })
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ errorMessage : "Failed to get users list" })
  }
}

const createUserAccount = async(req,res) => {
    console.log(req.body)
    try{
      if(!req.body){
          console.log('Error in creating user account')
          res.status(500).send({error: "Something went wrong in server!"})
          return 0
      }
      
      let user = new UserModel(req.body)
      await user.save()
      
      if(user){
          console.log("User account created successfully!")
          res.status(201).send({success : "User account created Successfully!"})
          const message = "Thanks for creating a user account at Music mix platform. Hope you like our music streaming services. Have a nice day!"
          Emails.notifyUser(user.email, message)
          return 0
      }
      console.log("Error while creating account")
  } catch (err) {
      console.log("Error in while creating account : ",err)
      res.status(500).send({error : "Something went wrong in server!"})
  }
}

const editUsers = async(req,res) => {
  try{
    const emp = await UserModel.findUserById(req.body.id)
    if(emp.email !== req.body.email ){
      const newpass = req.body.name.split(' ')[0]+'123'
      req.body.password = await bcrypt.hash(newpass,8)
      console.log(req.body)
      const updateEmp = await UserModel.updateOne({ _id : req.body.id }, { $set: req.body});
      if(updateEmp.matchedCount == 0){
        res.status(400).send({error : "Failed to edit employee details"});
        throw new Error("UserModel not found");
    } else {
       // await emails.sendStaffCredentials(req.body.email, newpass)
        res.status(200).send({success : "employee data updated successfully"})
    }
      
    } else {
      const updateEmp = await UserModel.updateOne({ _id : req.body.id },  {name : req.body.name});
      console.log(updateEmp)
      if(updateEmp.matchedCount == 0){
          res.status(400).send({error : "Failed to edit employee details"});
          throw new Error("UserModel not found");
      } else {
          res.status(200).send({success : "employee data updated successfully"})
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error : "Failed to edit employee details"})
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId = req.body.id;

    if (!userId) {
      return res.status(400).send({ error: "User ID is required" });
    }

    const deleteEmp = await UserModel.deleteOne({ _id: userId });

    if (deleteEmp.deletedCount === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    console.log("User deleted:", deleteEmp);
    return res.status(200).send({ success: "User deleted successfully" });

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send({ error: "Failed to delete user details" });
  }
}


const blockUser = async(req,res) =>  {
  try{
      const {id} = req.body
      console.log("id",id)
      if(id){
        const user = await UserModel.findUserById(id)
        if(user && user.isBlocked == false){
          user.isBlocked = true
          await user.save()
          res.status(200).send({success : "User Blocked successfully"})
        } else if(user && user.isBlocked == true){ 
          user.isBlocked = false
          await user.save()
          res.status(200).send({success : "User Unblocked successfully"})
        } else {
          res.status(404).send({error: "User not found"})
        }
      }
  } catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Failed to block user.' });
  }
}

const getSongs = async(req,res) => {
  try{
    const songs = await songModel.find()
    if(songs){
      res.status(200).send({ success: true, songs: songs })
    } else {
      res.status(200).send({ success: false, message: "No songs to show" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ errorMessage : "Failed to get songs list" });
  }
}

const getSong = async(req,res) => {
  try{
    const song = await songModel.findById({_id: req.query.id})
    if(song){
      res.status(200).send({ success: true, song: song })
    } else {
      res.status(200).send({ success: false, message: "No song to show" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ errorMessage : "Failed to get song" });
  }
}

module.exports = {
    testing,
    login,
    upload,
    getUsers,
    createUserAccount,
    editUsers,
    deleteSong,
    deleteUser,
    blockUser,
    register,
    getSongs,
    getSong,
    editSong
}