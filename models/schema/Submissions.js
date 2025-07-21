const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    quizId: {
        type: Number,
        required: [true, "QuizID required"]
    },
    score: {
        type: Number,
        required: [true, "Score required"]
    },
    timeTaken: {
        type: Number,
        required: [true, "Time taken required"]
    },
    answers: {
        type: Array,
        required: [true, "Answers required"]
    },
    name : {
        type: String,
        required: [true, "Username required"],
        default: "Anonymous Quizzer"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = submissionSchema;