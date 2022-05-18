const express = require('express')
const router = express.Router()

const checkAuth = require('../middleware/check-auth')
const { upload } = require("./../../app")

const UsersController = require('../controllers/users')


router.post("/users/register", UsersController.users_signup)

router.post("/users/login", UsersController.users_login)

router.post("/users/forgot-password", UsersController.forgot_password)

router.post("/users/reset-password", UsersController.reset_password)

router.get("/users/view-profile", checkAuth, UsersController.view_profile)

router.post("/users/change-password", UsersController.change_password)

router.patch("/users/add-profile-picture", checkAuth, upload.single('image'), UsersController.add_profile_picture)

router.patch("/users/update-info", checkAuth, UsersController.users_update)

router.get("/users/view-userlist", checkAuth, UsersController.view_userlist)

router.get("/users/view-following-userlist", checkAuth, UsersController.view_following_users)

router.post("/users/follow", checkAuth, UsersController.users_follow)

router.post("/users/unfollow", checkAuth, UsersController.users_unfollow)





module.exports = router;