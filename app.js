const express = require('express')
const app = express()

const dotenv = require('dotenv');
dotenv.config();


const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const extName = file.originalname.split(".")[1]
        const fileName = `${file.fieldname}-${uniqueSuffix}.${extName}`
        cb(null, fileName)
        // cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jfif') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}
exports.upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    },
    fileFilter: fileFilter
})




const cors = require('cors')

app.use(express.json())
app.use(cors())

const authRoutes = require('./api/routes/auth')
const userRoutes = require('./api/routes/users')
const postRoutes = require('./api/routes/post')

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/post', postRoutes)


app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})


module.exports = app