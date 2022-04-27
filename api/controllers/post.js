const db = require('../config/db')
const { QueryTypes } = require('sequelize')

const Post = require('../sequelize-models/Post')



exports.view_AllQuizlist = async (req, res, next) => {
    try {
        console.log("All Quizlist", req.body);
        const quizAll = await sequelizeQuiz.findAll({
            attributes: ['id', 'quiz_name', 'total_question', 'time', 'marks', 'questionlist']
        })
        console.log("quizlist", quizAll);

        // const test = await sequelize.query(`
        // select * 
        // from quiz_app.quiz
        // `)

        // console.log('tes', test);

        res.json({
            data: quizAll
            // data: test[0]
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }

}

exports.view_quizlist = async (req, res, next) => {

    console.log("one", req.user.id);

    const userQuizlist = [];
    const findUserId = await sequelizeUserQuizMapping.findAll({
        where: {
            user_id: req.user.id,
        },
        attributes: ["quiz_id"]
    })
    findUserId.map((val) => {
        userQuizlist.push(val.quiz_id)
    })
    console.log("list", userQuizlist);

    try {
        if (userQuizlist === undefined || userQuizlist.length === 0) {
            console.log("two")
            return res.status(404).send({ message: "Quiz is not found!!!" });

        } else {
            const quiz = await db.query(
                `SELECT
                    q.id,
                    q.quiz_name,
                    q.total_question,
                    q.marks,
                    q.time,
                    q.questionlist
                FROM
                    quiz_app.users u,
                    quiz_app.quiz q,
                    quiz_app.user_quiz_mapping uqm
                WHERE
                    u.id = uqm.user_id
                    AND q.id = uqm.quiz_id
                    AND u.id = ${req.user.id};`
                , {
                    type: QueryTypes.SELECT
                })

            res.json({
                message: "Find successfully", quiz
            })
        }

    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.create_post = async (req, res, next) => {
    console.log("post_create", req.body);
    // console.log("two", req.user);
    // console.log("three", req.user.id);

    // const user_id = req.user.id

    try {
        const { content, picture } = req.body;
        if (content === undefined) {
            return res.status(500).send({
                message: "Your content has some problem!"
            })
        }

        if (req.user.id) {
            const newPost = await Post.create({
                content,
                picture,
                user_id: req.user.id
            })
            // console.log(newPost)
            // console.log("newPostID", newPost.id)   
            if (!newPost) {
                const error = new Error('Post not created!');
                error.status = 500;
                throw error;
            }    
            res.json({
                data: "New Post created successfully",
                newPost
            })    
        } else {
            return res.status(403).json("Sorry, You are not eligible")
        }
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

