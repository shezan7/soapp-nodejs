const express = require('express')
const router = express.Router()

const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users')


router.post("/users/register", UsersController.users_signup)

router.post("/users/login", UsersController.users_login)

router.patch("/users/update-info", checkAuth, UsersController.users_update)

router.get("/users/view-all-user", checkAuth, UsersController.users_viewAll)

router.post("/users/follow", checkAuth, UsersController.users_follow)





module.exports = router;