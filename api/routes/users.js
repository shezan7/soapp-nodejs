const express = require('express')
const router = express.Router()

const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users')


router.post("/users/register", UsersController.users_signup)

router.post("/users/login", UsersController.users_login)

router.post("/users/change-password", UsersController.change_password)

router.post("/users/forgot-password", UsersController.forgot_password)

router.post("/users/reset-password", UsersController.reset_password)

router.patch("/users/update-info", checkAuth, UsersController.users_update)

router.get("/users/view-all-user", checkAuth, UsersController.users_viewAll)

router.post("/users/follow", checkAuth, UsersController.users_follow)

router.post("/users/unfollow", checkAuth, UsersController.users_unfollow)





module.exports = router;