const mongoose = require("mongoose")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")


const playlistSchema = mongoose.Schema({
    playlistName:{
        type:String,
        required:true,
        trim:true,
        unique: false
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    songs: [
        {
            type: String, 
            required: false,
            trim: true
        }
    ],
    owner:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


//creating a company model
const playlistModel = mongoose.model('Playlists',playlistSchema)

module.exports=playlistModel