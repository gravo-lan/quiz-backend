const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv/config');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@quizapp.meqbvli.mongodb.net/QuizApp?retryWrites=true&w=majority&appName=QuizApp`;
const app = express();
const PORT = 3000;

mongoose.connect(uri)
.then(() => console.log("Successfully connected to MongoDB!"))
.catch(err => console.error("Connection error", err));


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

const quizSchema = new mongoose.Schema({
  options: {
    type: [[String]],
    required: true,
    validate: {
      validator: function(options) {
        // Validate that each question has at least 2 options
        return options.every(questionOptions => questionOptions.length >= 2);
      },
      message: 'Each question must have at least 2 options'
    }
  },
  questions: {
    type: [String],
    required: true,
    validate: {
      validator: function(questions) {
        // Validate that there's at least one question
        return questions.length > 0;
      },
      message: 'There must be at least one question'
    }
  },
  solutions: {
    type: [Number],
    required: true,
    validate: [
      {
        validator: function(solutions) {
          // Validate that solutions array matches questions array length
          return solutions.length === this.questions.length;
        },
        message: 'Solutions array must match questions array length'
      },
      {
        validator: function(solutions) {
          // Validate that each solution index is valid for its options
          return solutions.every((solution, index) => {
            return solution >= 1 && solution <= this.options[index].length;
          });
        },
        message: 'Each solution must be a valid index for its question options'
      }
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  id: {
    type: Number,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model("Quiz",quizSchema);

function getSubmissionModel(quizId) {
    const collectionName = `quiz_${quizId}`;
    return mongoose.models[collectionName] || 
           mongoose.model(collectionName, submissionSchema, collectionName);
}

app.use(cors());
app.use(express.json());

app.get('/api/submissions/:id', async (req,res) => {
    try {
        const quizId = Number(req.params.id)

        if (isNaN(quizId)) {
            return res.status(400).json({ error: "Invalid quiz ID format" });
        }

        const Submission = getSubmissionModel(quizId);
        const submissions = await Submission.find({})
            .sort({ 
                score: -1,
                timeTaken: 1 
            })
            .limit(5)
            .exec();

        res.json(submissions);
    } catch (error) {
        console.error("Error retrieving submissions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/api/submissions/:id', async (req,res) => {
    try {
        const quizId = Number(req.params.id)

        if (isNaN(quizId)) {
            return res.status(400).json({ error: "Invalid quiz ID format" });
        }

        const Submission = getSubmissionModel(quizId);

        const submissions = await Submission.find({});
        res.json(submissions);
    } catch (error) {
        console.error("Error retrieving quiz:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/submit', async (req, res) => {
    const { quizId, score, timeTaken, answers, name } = req.body;

    try {
        // Get the model for this specific quiz
        const Submission = getSubmissionModel(quizId);
        
        // Create new submission
        const newSubmission = new Submission({
            quizId,
            score,
            timeTaken,
            answers,
            name
        });

        // Save to database
        await newSubmission.save();

        console.log(`Saved submission to collection: quiz_${quizId}`);
        res.status(200).json({ 
            message: "Submission received successfully.",
            collection: `quiz_${quizId}`
        });
    } catch (error) {
        console.error("Error saving submission:", error);
        res.status(500).json({ error: "Failed to save submission" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});