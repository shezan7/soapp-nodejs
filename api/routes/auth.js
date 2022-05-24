const express = require('express')
const router = express.Router()

const UsersController = require('../controllers/auth')


router.post("/register", UsersController.users_signup)

router.post("/login", UsersController.users_login)

router.post("/forgot-password", UsersController.forgot_password)

router.post("/reset-password", UsersController.reset_password)



module.exports = router