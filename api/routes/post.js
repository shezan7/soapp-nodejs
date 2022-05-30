const express = require("express")
const router = express.Router()
const checkAuth = require('../middleware/check-auth')
const { upload } = require("./../../app")

const PostController = require('../controllers/post')


router.use(checkAuth)

router.post("/create-post", PostController.create_post)

router.patch("/upload-image-to-post/:post_id", upload.single('image'), PostController.upload_image_to_post)

// router.get("/post/get-upload-image/:post_id", PostController.get_upload_image)

router.patch("/update-post/:id", PostController.update_post)

router.delete("/delete-post/:id", PostController.delete_post)

router.get("/total-post", PostController.total_post)

router.get("/view-post", PostController.view_post)

router.post("/like-unlike", PostController.post_like_unlike)

// router.post("/like", PostController.post_like)

// router.post("/unlike", PostController.post_unlike)

// router.get("/total-like/:post_id", PostController.total_like)

router.post("/create-comment", PostController.create_comment)

router.get("/view-comment/:post_id", PostController.view_comment)

router.patch("/update-comment/:id", PostController.update_comment)

router.delete("/delete-comment/:id", PostController.delete_comment)



module.exports = router;