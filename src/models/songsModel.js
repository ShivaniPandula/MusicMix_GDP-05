const mongoose = require("mongoose")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")


const songSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    album:{
        type:String,
        required:true,
        trim:true,
    },
    duration:{
        type:String,
        required:true,
        trim:true,
    },
    artist:{
        type:String,
        required:true,
        trim:true,
    },
    year:{
        type:String,
        required:true,
        trim:true,
    },
    songUrl: {
        type: String,
        required : false
    },
    imgUrl: {
        type: String,
        required : false
    },
    lyrics: {
        type : String,
        required : false,
        trim : true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    songId: {
        type : String,
        required : false,
        trim : true,
        unique : true
    },
    genre: {
        type: String,
        required: false,
        trim: true,
        default: "Music"
    },
    tokens:[
       {
           token:{
               type:String,
               required: false
           }
       }
    ]
})

//userdef function for hiding private data
songSchema.methods.toJSON = function(){
    const song = this
    const userObj = song.toObject()
    delete userObj.tokens
    return userObj
} 

//userdef function for gen auth token
songSchema.methods.genAuthToken = async function(days){
    const song=this
    const token = jwt.sign({_id:song._id.toString()},"thisisseceret",{ expiresIn:days})
    song.tokens=song.tokens.concat({token})
    await song.save()
    return token
}

//userdef function for authentication
songSchema.statics.findByCredentials = async (email,password) => {
    const song = await songModel.findOne({ email })   
    if(!song){
        throw new Error("Email is incorrect")
    }
    const isMatched = await bcrypt.compare(password,song.password)
    if(!isMatched){
        throw new Error("password is incorrect")
    }
    return song
}


//userdef function for authentication
songSchema.statics.findByName = async (name) => {
    // console.log("erwe")
    const song = await songModel.findOne({ name : name })
   // console.log(song,"song")
    if(!song){
        console.error("unable to find song")
    }
    return song
}

songSchema.statics.findByAlbum = async (album) => {
    // console.log("erwe")
    const song = await songModel.find({ album : album })
   // console.log(song,"song")
    if(!song){
        console.error("unable to find songs")
    }
    return song
}

songSchema.statics.findByArtist = async (artist) => {
    // console.log("erwe")
    const song = await songModel.find({ artist : artist })
   // console.log(song,"song")
    if(!song){
        console.error("unable to find songs")
    }
    return song
}

songSchema.statics.findByYear = async (year) => {
    // console.log("erwe")
    const song = await songModel.find({ year : year })
   // console.log(song,"song")
    if(!song){
        console.error("unable to find song")
    }
    return song
}


//userdef function for authentication
songSchema.statics.findUserById = async (songId) => {
    console.log("reached schema")
    const song = await songModel.findById({songId : songId})
    // console.log(song,"song")
    if(!song){
        throw new Error("unable to find")
    }
    return song
}

// Counter schema
const counterSchema = mongoose.Schema({
    _id: { type: String, default: 'songCount' },
    seq: { type: Number, default: 0 }
  });
  
  // Create a Counter model
  const Counter = mongoose.model('songCounter', counterSchema);

  
  // Pre-save hook to auto-increment songId 
  songSchema.pre('save', async function(next) {
    if (this.isNew) {
      try {
        const counter = await Counter.findByIdAndUpdate({ _id: 'songCount' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seq = counter.seq.toString().padStart(2, '0');
        console.log("Music seq - ",seq)
        this.songId = 'Music-' + seq;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  });


//creating a company model
const songModel = mongoose.model('Songs',songSchema)

module.exports=songModel