const express = require('express')
const router = express.Router()

const UsersController = require('../controllers/users')


router.post("/users/register", UsersController.users_signup)

router.post("/users/login", UsersController.users_login)



module.exports = router;