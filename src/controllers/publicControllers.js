const UserModel = require('../models/UsersModel.js')
const songModel = require('../models/songsModel.js')
const PlaylistModel = require('../models/PlaylistsModel.js')
const Emails = require('../mails/email.js')
const path = require('path');
const bcrypt=require("bcryptjs")
const dotenv=require('dotenv').config()
const jwt=require("jsonwebtoken");
const Jwt_Secret="thisissecret";
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const playlistModel = require('../models/PlaylistsModel.js');
const userModel = require('../models/UsersModel.js');

var savedOTPS = {

};

const login = async(req, res) => {
    try{
        if(req.body){
            let token
            const {email, password} = req.body;
            const user = await UserModel.findByEmail(email)
            if(user){
              // //  console.log("Login user -> ", user)
                const isMatch = await bcrypt.compare(password, user.password)
                if(!isMatch){
                  // //  console.log('Entered Wrong Password!')
                    res.status(300).send({error: "Incorrect Password"})
                    return 0
                }

                if(user.isBlocked){
                  // //  console.log('User account Blocked!')
                    res.status(300).send({error: "Your account has been restricted by an admin!"})
                    return 0
                }

                if(req.query){
                    token = await user.genAuthToken("30 days")
                } else {
                    token = await user.genAuthToken("7 days")
                }
                
                res.status(201).send({success : "Login success", token : token, user : user})
              
                return 0
            }
            res.status(404).send({error : "Incorrect Email"})
        }
    } catch (err) {
       ////  console.log("Error in while login : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}


const register = async(req,res) => {
  // //  console.log(req.body)
    try{
        if(!req.body){
          // //  console.log('Error in creating user account')
            res.status(500).send({error: "Something went wrong in server!"})
            return 0
        }
        
        let user = new UserModel(req.body)
        if(req.file.path) user.profileUrl = req.file.path
        await user.save()
        
        if(user){
          // //  console.log("User account created successfully!")
            res.status(201).send({success : "Registered Successfully!"})
            return 0
        }
       ////  console.log("Error while creating account")
    } catch (err) {
       ////  console.log("Error in while creating account : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}


const generateOTP = async (req,res) => {
    try{
        const email = req.body.email
       ////  console.log(email, req.body)
        let randomdigit = Math.floor(100000 + Math.random() * 900000);
        await Emails.sendOTP(email, randomdigit)
        savedOTPS[email] = randomdigit;
        setTimeout(() => {
            delete savedOTPS[`${email}`];
        }, 180000);
       //  console.log(savedOTPS);
        res.status(200).send({success: `OTP sent to ${email}`})
    } catch (err) {
       ////  console.log("Error in while sending otp : ",err)
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
       ////  console.log("Error in while checking OTP : ",err)
        res.status(500).send({error : "Something went wrong in server!"})
    }
}

const resetPasswordRequest = async(req,res) => {
    const email = req.body.email
    try{
        const user = await UserModel.findByEmail(email)
        if(!user){
            res.status(404).send({error: "Email not registered"})
        }
        const secret=Jwt_Secret + user.password
        const payload={
            email:user.email,
            id:user.id
        }
        const token=jwt.sign(payload,secret,{expiresIn:'30m'})
        //console.log(token);
        const encrypt = btoa(`id=${user.id}&token=${token}`)
        const link=`http://${process.env.IP}:${process.env.PORT || 4040}/resetpassword.html?${encrypt}`
        // const baseUrl = process.env.BASE_URL || http://localhost:${process.env.PORT || 8080};
        // const link = ${baseUrl}/resetpassword.html?${encrypt};
      // //  console.log(link);
        await Emails.sendResetLink(email,link)
        res.status(200).send({success:"Password reset link sent to mail id"})
    }
    catch(err){
      // //  console.log("Error in while requesting reset password : ",err)
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
      // //  console.log("Error in while changing password : ",err)
        res.status(400).send({error: "Unable to change password, Please try again later"})
    }
}

const getSongs = async (req,res) => {
    try{
        const songs = await songModel.find()
        if(songs.length > 0){
            res.status(200).send({success: true, songs: songs})
        } else {
            res.status(200).send({success: false, empty: "No songs found"})
        }
    } catch (err) {
       ////  console.log("Error while fetching songs :", err)
        res.status(300).send({error : "Something went wrong with server"})
    }
}

const createPlaylist = async(req,res) => {
   ////  console.log(req.body)
    try{
      if(!req.body){
         ////  console.log('Error in creating playlist')
          res.status(500).send({error: "Something went wrong in server!"})
          return 0
      }
      
      let playlist = new playlistModel(req.body)
      await playlist.save()
      
      if(playlist){
         ////  console.log("playlist account created successfully!")
          res.status(201).send({success : "Playlist created Successfully!"})
          return 0
      }
     ////  console.log("Error while creating account")
  } catch (err) {
     ////  console.log("Error in while creating playlist : ",err)
      res.status(500).send({error : "Something went wrong in server!"})
  }
}

const updatePlaylist = async (req,res) => {
    try {
        if(req.body){
            const song = req.body.song
            const playlist = req.body.playlistName
            const owner = req.body.owner
            const update = await PlaylistModel.updateOne({ playlistName: playlist, owner: owner},{ $push: { songs: song } });
          // //  console.log(update)
            if (update.modifiedCount == 0) {
                return res.status(404).json({ error: "playlist not found." });
            } else {
                return res.status(200).json({success: "Music added"});
            }
        } else {
            return res.status(404).json({ error: "playlist not found." });
        }
        
    } catch (err) {
       ////  console.log("Error processing request ", err)
        res.status(500).send({error: "Database error"});
    }
}

const getPlaylist = async (req, res) => {
    try {
        if (req.query.playlist) {
            
            const playlist = await PlaylistModel.findOne({ playlistName: req.query.playlist });

            if (playlist) {
                
                const songIds = playlist.songs; 
                const songsData = await songModel.find({ songId: { $in: songIds } }); 

                res.status(200).send({ 
                    success: true, 
                    playlist: playlist, 
                    songs: songsData
                });
            } else {
                res.status(200).send({ success: false, empty: "No playlist found" });
            }
        }
    } catch (error) {
       ////  console.log("Error while fetching playlist:", error);
        res.status(500).send({ error: "Something went wrong on the server!" });
    }
};

const deleteSongInPlaylist = async (req, res) => {
    try {
        const { playlist, owner, songId } = req.query;

        const update = await PlaylistModel.updateOne(
            { playlistName: playlist, owner: owner },  
            { $pull: { songs: songId } }
        );

        if (update.modifiedCount > 0) {
            res.status(200).send({ success: "Music deleted from playlist successfully." });
        } else {
            res.status(404).send({ error: "Playlist or song not found." });
        }

    } catch (err) {
       ////  console.log("Error while deleting song from playlist: ", err);
        res.status(500).send({ error: "Something went wrong in server!" });
    }
};

const deletePlaylist = async (req, res) => {
    try {
        const { playlist, owner } = req.query;

        const result = await PlaylistModel.deleteOne({ playlistName: playlist, owner: owner });

        if (result.deletedCount > 0) {
            res.status(200).send({ success: "Playlist deleted successfully." });
        } else {
            res.status(404).send({ success: "Playlist not found." });
        }

    } catch (err) {
       ////  console.log("Error while deleting playlist: ", err);
        res.status(500).send({ error: "Something went wrong on the server!" });
    }
};



const getAllPlaylists = async(req,res ) => {
    try{
        if(req.query){
            const playlist = await PlaylistModel.find({owner: req.query.user});
            if(playlist){
                res.status(200).send({success: true, playlist: playlist});
            } else {
                res.status(200).send({success: false, empty: "No playlist found"});
            }
        } else {

        }
        
    } catch (err) {
      // //  console.log("Error in while fetching playlists : ",err);
        res.status(500).send({error : "Something went wrong in server!"});
    }
}

const likeSong = async (req, res) => {
    try {
        const { user, id } = req.query;
       //  console.log(user, id)
        const getUser = await userModel.findByEmail(user);
        if (!getUser) {
            return res.status(404).send({ message: "getUser not found." });
        }
        const songIndex = getUser.likedSongs.indexOf(id);
        if (songIndex === -1) {
            getUser.likedSongs.push(id);
            await getUser.save();
            return res.status(200).send({success: true})
        } else {
            getUser.likedSongs.splice(songIndex, 1);
            await getUser.save();
            return res.status(200).send({success: true})
        }
    } catch (error) {
       //  console.log("Error processing request ", error);
        res.status(500).send({error: error});
    }
}

const getLikes = async (req, res) => {
    try {
        const { user } = req.query;
        ////  console.log(user)
        const getUser = await userModel.findByEmail(user);
        if (!getUser) {
            return res.status(404).json({ message: "User not found." });
        } else {
            return res.status(200).json({list: getUser.likedSongs});
        }
    } catch (error) {
       //  console.log("Error processing request ", error);
        res.status(500).send({error: error});
    }
}

async function getRecommendedSongs(req, res) {
    try {
        const userId = req.query.id;
        const user = await UserModel.findOne({ email: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
      
        const likedSongs = user.likedSongs;
       //  console.log("Liked songs:", likedSongs);

        if (!likedSongs || likedSongs.length === 0) {
            return res.status(200).json({ message: "Empty", recommendations: [] });
        }

        const genres = await Promise.all(likedSongs.map(songId => getSongGenre(songId)));
       //  console.log("Genres:", genres); 

        const genreCount = genres.reduce((acc, genre) => {
            if (genre) {
                acc[genre] = (acc[genre] || 0) + 1;
            }
            return acc;
        }, {});

        const sortedGenres = Object.keys(genreCount).sort((a, b) => genreCount[b] - genreCount[a]);
       //  console.log("Sorted genres by popularity:", sortedGenres);

        const topGenres = sortedGenres.slice(0, 3); 

        const recommendedSongs = await songModel.find({
            songId: { $nin: likedSongs },
            genre: { $in: topGenres }
        });

        if (recommendedSongs.length === 0) {
            return res.status(200).json({
                message: "No new songs found in liked genres. Trying different genres.",
                recommendations: []
            });
        }

        res.status(200).send({
            message: "Personal recommendations fetched based on your liked genres",
            songs: recommendedSongs
        });

    } catch (error) {
       //  console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getSongGenre(songId) {
    try {
        const song = await songModel.findOne({ songId });
        if (!song || !song.genre) {
           //  console.log(`No genre found for song: ${songId}`);
            return null;
        }
        return song.genre;
    } catch (error) {
       //  console.error(`Error fetching genre for songId ${songId}:`, error);
        return null;
    }
}

const updateProfile =  async (req,res) => {
    try{
       ////  console.log(req.file)
       ////  console.log("Update request received ", req.body)
        if(req.body.user){
            const {name, email, address, dob} = req.body
            const imageURL = req.file.path
            let updateUser = await UserModel.findByEmail(req.body.user)
            if(updateUser){
              ////  console.log(updateUser);
               updateUser.name = name
               updateUser.email = email
               updateUser.address = address
               updateUser.dob = dob
               updateUser.profileUrl = imageURL

               await updateUser.save()

               res.status(200).send({success : "Profile edited successfully", user: updateUser});
               return
            }

            res.status(300).send({success : "Profile not found"});
            return
        }
    } catch (err) {
       ////  console.log("Error while updating user profile : ", err);
        res.status(300).send({error : "Something went wrong in server!"})
        return
    }
}

module.exports = {
    login,
    register,
    generateOTP,
    checkOTP,
    resetPasswordRequest,
    changePassword,
    getSongs,
    createPlaylist,
    deletePlaylist,
    deleteSongInPlaylist,
    getAllPlaylists,
    likeSong,
    getLikes,
    updatePlaylist,
    getPlaylist,
    getRecommendedSongs,
    updateProfile
}
