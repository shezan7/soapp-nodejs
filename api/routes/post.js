const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

const PostController = require('../controllers/post')


router.use(checkAuth);

router.post("/post/create-post", PostController.create_post)

router.get("/post/view-post", PostController.view_post)



module.exports = router;