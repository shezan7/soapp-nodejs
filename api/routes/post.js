const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

const PostController = require('../controllers/post')


router.use(checkAuth);

// router.get("/quiz/view-allQuizlist", checkUser(5), QuizController.view_AllQuizlist);

// router.get("/quiz/view-quizlist", checkUser(4), QuizController.view_quizlist);

router.post("/post/create-post", PostController.create_post);



module.exports = router;