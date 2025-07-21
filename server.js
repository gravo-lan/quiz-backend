dotenv = require('dotenv/config');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const connectDB = require('./conifg/db');
const quizRoutes = require('./routes/quiz');

connectDB();

app.use(cors());
app.use(express.json());

app.use(quizRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});