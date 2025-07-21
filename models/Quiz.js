const mongoose = require('mongoose');

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

module.exports = mongoose.model("Quiz",quizSchema);