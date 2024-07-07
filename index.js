const express = require('express');
const cors = require('cors'); // Import cors
const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cors({ origin: "*" })); // Use cors middleware

const appRouter = require('./routes/app.routes');

app.use("/", appRouter);

app.listen(process.env.PORT, () => console.log("Server is running on port 5000"));