const mongoose = require("mongoose")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")


const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique: true,
        required:true,
        trim:true,
        lowercase:true, 
    },
    dob: {
        type: String,
        required: false,
        trim: true
    },
    password:{
        type:String,
        required:false,
        trim:true,
    },
    verified:{
        type: Boolean,
        default: false
    },
    profileUrl:{
        type: String,
        required: false
    },
    address:{
        type:String,
        required:false,
        trim:true,
    },
    isBlocked:{
        type: Boolean,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    isActive:{
        type: Boolean,
        default: false
    },
    socketId: {
        type:String,
        require: false
    },
    likedSongs: [
        {
            type: String, 
            required: false,
            trim: true,
            ref: 'Songs',
        }
    ],
    tokens:[
       {
           token:{
               type:String,
           }
       }
    ]
})

//userdef function for hiding private data
userSchema.methods.toJSON = function(){
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    return userObj
} 

//userdef function for gen auth token
userSchema.methods.genAuthToken = async function(days){
    const user=this
    const token = jwt.sign({_id:user._id.toString()},"thisisseceret",{ expiresIn:days})
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

//userdef function for authentication
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await userModel.findOne({ email })   
    if(!user){
        throw new Error("Email is incorrect")
    }
    const isMatched = await bcrypt.compare(password,user.password)
    if(!isMatched){
        throw new Error("password is incorrect")
    }
    return user
}


//userdef function for authentication
userSchema.statics.findByEmail = async (email) => {
    // console.log("erwe")
    const user = await userModel.findOne({ email })
   // console.log(user,"user")
    if(!user){
        throw new Error("unable to find")
    }
    return user
}

//userdef function for authentication
userSchema.statics.findUserById = async (id) => {
    console.log("reached schema")
    const user = await userModel.findById({_id : id})
    // console.log(user,"user")
    if(!user){
        throw new Error("unable to find")
    }
    return user
}


//using mongoose middleware for hashing passwords
userSchema.pre("save",async function (next) {
    const user =this
    
   if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password,8);
       user.isBlocked = false;
   }
    next()
})

//creating a user model
const userModel = mongoose.model('Users',userSchema)

module.exports=userModel