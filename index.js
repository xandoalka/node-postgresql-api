const express = require("express")
const app = express()

require('dotenv').config()

app.use(express.json())

const appRouter = require('./routes/app.routes')

app.use("/", appRouter)

app.listen(process.env.PORT, () => console.log("Server is running on port 5000"))