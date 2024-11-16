
const mongoose = require('mongoose');
const dotenv=require('dotenv').config()
const connectionString = process.env.DB_URL
console.log(connectionString)

const connectDatabase = async () => {
    try {
        const { connection } = await mongoose.connect(connectionString);
        console.log(`Database connected to: ${connection.name}`);
    } catch (err) {
        console.error("Database connection error:", err);
    }
};

module.exports = connectDatabase;


// mongodb+srv://music:music123@musixmix.ki8te.mongodb.net/Musicmix?retryWrites=true&w=majority&appName=Musixmix -- mine

//  mongodb+srv://music:music123@music.jcpt0.mongodb.net/Musicmix?retryWrites=true&w=majority&appName=music