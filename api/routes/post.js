const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

const PostController = require('../controllers/post')


router.use(checkAuth);

router.post("/post/create-post", PostController.create_post)

router.patch("/post/update-post", PostController.update_post)

router.post("/post/delete-post", PostController.delete_post)

router.get("/post/view-post", PostController.view_post)

router.post("/post/create-like", PostController.create_like)

router.post("/post/create-comment", PostController.create_comment)

router.patch("/post/update-comment", PostController.update_comment)

router.post("/post/delete-comment", PostController.delete_comment)



module.exports = router;