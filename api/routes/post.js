const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth')
const { upload } = require("./../../app")

const PostController = require('../controllers/post')


router.use(checkAuth)


router.post("/post/create-post", PostController.create_post)

// router.post("/post/create-post", upload.single('image'), PostController.create_post)

router.patch("/post/update-post/:id", PostController.update_post)

router.delete("/post/delete-post/:id", PostController.delete_post)

router.get("/post/view-post", PostController.view_post)

router.post("/post/like", PostController.post_like)

router.post("/post/unlike", PostController.post_unlike)

router.post("/post/create-comment", PostController.create_comment)

router.patch("/post/update-comment/:id", PostController.update_comment)

router.delete("/post/delete-comment/:id", PostController.delete_comment)



module.exports = router;