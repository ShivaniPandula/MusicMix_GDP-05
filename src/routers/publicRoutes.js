const express=require("express")
const router = new express.Router()
const Jwt_Secret="thisisseceret"

const dotenv=require('dotenv').config()
const multer = require("multer");
const path = require('path');
const time = new Date()
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Controllers = require('../controllers/publicControllers');
const UserModel = require('../models/UsersModel.js')
const axios = require('axios');


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

const upload = multer({ storage: storage });

// GET Routes
router.get('/test', (req,res)=>{
    res.send({ response : "Server is running"})
})
router.get('/getSongs', Controllers.getSongs);
router.get('/geAllPlaylists', Controllers.getAllPlaylists);
router.get('/likeSong', Controllers.likeSong); // Like / Unlike route
router.get('/getLikes', Controllers.getLikes);
router.get('/getPlaylist', Controllers.getPlaylist);
router.get('/deleteSongInPlaylist', Controllers.deleteSongInPlaylist); // Remove song from playlist
router.get('/deletePlaylist', Controllers.deletePlaylist);
router.get('/getRecommendations', Controllers.getRecommendedSongs);

router.get('/download', async (req, res) => {
    const { url, filename } = req.query;

    try {
        const response = await axios.get(url, { responseType: 'stream' });
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Error downloading the file:', error);
        res.status(500).send('Failed to download the file');
    }
});



// POST Routes
router.post('/login', Controllers.login)  // Login Route
router.post('/register',upload.single('image'), Controllers.register) // Register Route
router.post('/sendOTP', Controllers.generateOTP) // Gen OTP Route
router.post('/checkOTP', Controllers.checkOTP) // Check OTP Route
router.post('/resetPasswordRequest', Controllers.resetPasswordRequest)  // Reset Pass Req Route
router.post('/createPlaylist', Controllers.createPlaylist);
router.post('/updatePlaylist', Controllers.updatePlaylist);

// PATCH Routes



// PUT Routes
router.put('/changePassword', Controllers.changePassword)   // Change Pass Route
router.post('/updateProfile',upload.single('image'), Controllers.updateProfile);


// DELETE Routes



module.exports = router