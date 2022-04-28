const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

const PostController = require('../controllers/post')


router.use(checkAuth);

router.post("/post/create-post", PostController.create_post)

router.get("/post/view-post", PostController.view_post)

router.post("/post/create-like", PostController.create_like)

router.post("/post/create-comment", PostController.create_comment)



module.exports = router;