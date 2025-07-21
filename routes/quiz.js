const express = require('express');
const router = express.Router();

const Quiz = require('../models/Quiz');
const submissionSchema = require('../models/schema/Submissions')

function getSubmissionModel(quizId) {
    const collectionName = `quiz_${quizId}`;
    return mongoose.models[collectionName] || 
           mongoose.model(collectionName, submissionSchema, collectionName);
}

router.get('/api/submissions/:id', async (req,res) => {
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

router.get('/api/data/:id', async (req, res) => {
  try {
    const quizId = Number(req.params.id);
    
    if (isNaN(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID format" });
    }

    const quiz = await Quiz.findOne({ id: quizId });
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error retrieving quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/api/submit', async (req, res) => {
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

module.exports = router;