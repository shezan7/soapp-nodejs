const express = require('express')
const app = express()

const dotenv = require('dotenv');
dotenv.config();


const cors = require('cors')

app.use(express.json())
app.use(cors())


const userRoutes = require('./api/routes/users')
const postRoutes = require('./api/routes/post')

app.use(userRoutes)
app.use(postRoutes)


app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})


module.exports = app