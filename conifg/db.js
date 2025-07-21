const mongoose = require('mongoose');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@quizapp.meqbvli.mongodb.net/QuizApp?retryWrites=true&w=majority&appName=QuizApp`;

const connectDB = () => {
    mongoose.connect(uri)
    .then(() => console.log("Successfully connected to MongoDB!"))
    .catch(err => console.error("Connection error", err));
}

module.exports = connectDB;