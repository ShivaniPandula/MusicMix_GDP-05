const express=require("express")
const router = new express.Router()
const Jwt_Secret="thisisseceret"

const dotenv=require('dotenv').config()
const multer = require("multer");
const path = require('path');
const time = new Date()
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Controllers = require('../controllers/adminControllers.js')


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

const storages = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', '..', 'tmp_files'));
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + time.getHours()+ '-' + time.getMinutes() + '_' + file.originalname)
    },
  });
  
const upload = multer({ storage: storages });

router.get('/test', (req,res)=>{
    res.send({ response : "Server is running..."})
})

router.get('/getUsers', Controllers.getUsers);
router.get('/getSongs', Controllers.getSongs);
router.get('/getSong', Controllers.getSong);
router.get('/deleteSong', Controllers.deleteSong);

// POST Requests
router.post('/login', Controllers.login)
router.post('/register', Controllers.register)
router.post('/addSong', upload.fields([{ name: 'song', maxCount: 1 }, { name: 'image', maxCount: 1 }]), Controllers.upload);
router.post('/createUserAccount', Controllers.createUserAccount)
router.post('/testing', Controllers.testing)
router.post('/blockUser', Controllers.blockUser)
router.post('/editSong', Controllers.editSong)
router.post("/deleteUser", Controllers.deleteUser)

module.exports = router
