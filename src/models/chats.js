const mongoose = require('mongoose')

const Chatschema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: false
    },
    id: {
        type:String,
        required: true
    },
    role: {
        type: String,
    }
},
{
    timestamps : true
}
)


Chatschema.pre("save",async function (next) {
    const user =this
    console.log("chat data received")
    next()
})

//userdef function for authentication
Chatschema.statics.findByUsername = async (username) => {
    
    const user = await Chats.findOne({ username })
    console.log(user,"user")
   
    return user

}

//userdef function for authentication
Chatschema.statics.findIsUserActive = async (username) => {
    
    const user = await Chats.findOne({ username })
    console.log(user,"active user")
   
    return user

}



//creating a user model
const Chats = mongoose.model('Chats',Chatschema)

module.exports=Chats
