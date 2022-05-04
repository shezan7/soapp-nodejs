const db = require('../config/db')
const { QueryTypes } = require('sequelize')

const Post = require('../sequelize-models/Post')
const Like = require('../sequelize-models/Like')
const Comment = require('../sequelize-models/Comment')



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

exports.update_post = async (req, res, next) => {
    console.log("post_update", req.body)
    // console.log("one", req.user.id);
    const userPosts = [];
    const findUserId = await Post.findAll({
        where: {
            user_id: req.user.id,
        },
        attributes: ["id"]
    })
    findUserId.map((val) => {
        // console.log('Value', val.id);
        userPosts.push(val.id)
    })
    console.log("list", userPosts)

    try {
        const { id, content, picture } = req.body

        // console.log(userPosts.includes(req.body.id))   
        if (userPosts.includes(req.body.id)) {
            const newPost = await Post.update({
                content, picture
            }, {
                where: {
                    id
                }
            })
            // console.log(newPost)
            // console.log("newPostID", newPost.id)   
            res.json({
                data: "Post updated successfully",
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

exports.delete_post = async (req, res, next) => {
    console.log("post_delete", req.body)
    // console.log("one", req.user.id);
    const userPosts = [];
    const findUserId = await Post.findAll({
        where: {
            user_id: req.user.id,
        },
        attributes: ["id"]
    })
    findUserId.map((val) => {
        // console.log('Value', val.id);
        userPosts.push(val.id)
    })
    console.log("list", userPosts)

    try {
        const { id } = req.body

        // console.log(userPosts.includes(req.body.id))   
        if (userPosts.includes(req.body.id)) {
            const newPost = await Post.destroy({
                where: {
                    id
                }
            })
            // console.log(newPost)
            // console.log("newPostID", newPost.id)   
            res.json({
                data: "Post deleted successfully",
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

exports.view_post = async (req, res, next) => {
    // console.log("two", req.user);
    // console.log("three", req.user.id);

    // const user_id = req.user.id

    try {
        if (req.user.id) {
            const post = await db.query(
                `SELECT
                    p.id,
                    p.content,
                    p.picture
                FROM
                    soapp.posts p
                WHERE
                    (p.user_id = ${req.user.id}
                        OR p.user_id IN (SELECT 
                                            f.following_user 
                                        FROM 
                                            soapp.follows f 
                                        WHERE 
                                            f.user_id = ${req.user.id}));`
                , {
                    type: QueryTypes.SELECT
                })

            // console.log(post.length)
            if (!post) {
                const error = new Error('Post has some problem');
                error.status = 500;
                throw error;
            }
            if (post.length === 0) {
                return res.status(403).json("Post is not found!")
            }

            res.json({
                data: "Post found successfully",
                post
            })
        }
        else {
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

exports.create_like = async (req, res, next) => {
    console.log("like_create", req.body);
    // console.log("two", req.user);
    // console.log("three", req.user.id);

    // const user_id = req.user.id

    try {
        const { post_id } = req.body;
        if (post_id === undefined) {
            return res.status(500).send({
                message: "Some problem found"
            })
        }

        if (req.user.id) {
            const newLike = await Like.create({
                user_id: req.user.id,
                post_id
            })
            // console.log(newLike)
            // console.log("newLikeID", newLike.id)   
            if (!newLike) {
                const error = new Error('Like not created!');
                error.status = 500;
                throw error;
            }
            res.json({
                data: "Like created successfully",
                newLike
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

exports.create_comment = async (req, res, next) => {
    console.log("comment_create", req.body);
    // console.log("two", req.user);
    // console.log("three", req.user.id);

    // const user_id = req.user.id

    try {
        const { post_id, content } = req.body;
        if (post_id === undefined || content === undefined) {
            return res.status(500).send({
                message: "Some problem found"
            })
        }

        if (req.user.id) {
            const newComment = await Comment.create({
                user_id: req.user.id,
                post_id,
                content
            })
            // console.log(newComment)
            // console.log("newCommentID", newComment.id)   
            if (!newComment) {
                const error = new Error('Comment not created!');
                error.status = 500;
                throw error;
            }
            res.json({
                data: "Comment created successfully",
                newComment
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

exports.update_comment = async (req, res, next) => {
    console.log("comment_update", req.body);
    // console.log("one", req.user.id);
    const userComments = [];
    const findUserId = await Comment.findAll({
        where: {
            user_id: req.user.id,
        },
        attributes: ["id"]
    })
    findUserId.map((val) => {
        // console.log('Value', val.id);
        userComments.push(val.id)
    })
    console.log("list", userComments)

    try {
        const { id, content } = req.body

        // console.log(userComments.includes(req.body.id))   
        if (userComments.includes(req.body.id)) {
            const newComment = await Comment.update({
                content
            }, {
                where: {
                    id
                }
            })
            // console.log(newComment)
            // console.log("newCommentID", newComment.id)   
            res.json({
                data: "Comment updated successfully",
                newComment
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

exports.delete_comment = async (req, res, next) => {
    console.log("comment_delete", req.body);
    // console.log("one", req.user.id);
    const userComments = [];
    const findUserId = await Comment.findAll({
        where: {
            user_id: req.user.id,
        },
        attributes: ["id"]
    })
    findUserId.map((val) => {
        // console.log('Value', val.id);
        userComments.push(val.id)
    })
    console.log("list", userComments)

    try {
        const { id } = req.body

        // console.log(userComments.includes(req.body.id))   
        if (userComments.includes(req.body.id)) {
            const newComment = await Comment.destroy({
                where: {
                    id
                }
            })
            // console.log(newComment)
            // console.log("newCommentID", newComment.id)   
            res.json({
                data: "Comment deleted successfully",
                newComment
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