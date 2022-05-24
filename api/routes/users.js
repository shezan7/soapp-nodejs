const express = require('express')
const router = express.Router()

const checkAuth = require('../middleware/check-auth')
const { upload } = require("./../../app")

const UsersController = require('../controllers/users')


router.use(checkAuth)

router.get("/view-profile", UsersController.view_profile)

router.patch("/change-password", UsersController.change_password)

router.patch("/add-profile-picture", upload.single('image'), UsersController.add_profile_picture)

router.patch("/update-info", UsersController.users_update)

router.get("/view-userlist", UsersController.view_userlist)

router.get("/view-following-userlist", UsersController.view_following_users)

router.post("/follow", UsersController.users_follow)

router.post("/unfollow", UsersController.users_unfollow)

router.get("/view-followers", UsersController.view_followers)

router.get("/view-following_users", UsersController.view_following_users)



module.exports = router