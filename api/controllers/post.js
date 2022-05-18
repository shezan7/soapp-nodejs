const db = require('../config/db')
const { QueryTypes } = require('sequelize')

const Post = require('../sequelize-models/Post')
const Like = require('../sequelize-models/Like')
const Comment = require('../sequelize-models/Comment')



exports.create_post = async (req, res, next) => {
    console.log("post_create", req.body);
    // console.log("two", req.user)
    // console.log("three", req.user.id)
    // console.log(req.file)

    try {
        const { content, tag_id } = req.body

        if (content === undefined) {
            return res.status(500).send({
                message: "Your content has some problem!"
            })
        }

        if (req.user.id) {
            const newPost = await Post.create({
                content,
                // picture: req.file.filename,
                user_id: req.user.id,
                tag_id
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
    console.log("post_update", req.params.id, req.body.content)
    // console.log("one", req.user.id);
    const userPosts = []
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
        const { id } = req.params
        const { content } = req.body

        console.log(userPosts.includes(+req.params.id))
        if (userPosts.includes(+req.params.id)) {
            const newPost = await Post.update({
                content,
                // picture: req.file.filename
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
    console.log("post_delete", req.params)
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
        const { id } = req.params
        // console.log(userPosts.includes(+req.body.id))   
        if (userPosts.includes(+req.params.id)) {
            const newPost = await Post.destroy({
                where: {
                    id
                }
            })
            // console.log(newPost)
            // console.log("newPostID", newPost.id)  
            if (!newPost) {
                const error = new Error('Delete Post not generated!');
                error.status = 500;
                throw error;
            }
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
                    p.picture,
                    p.tag_id,
                    u.first_name,
                    u.last_name
                FROM
                    soapp.posts p,
                    soapp.users u
                WHERE
                    u.id = p.user_id
                    AND (p.user_id = ${req.user.id}
                        OR p.user_id IN (SELECT 
                                            f.following_user 
                                        FROM 
                                            soapp.follows f 
                                        WHERE 
                                            f.user_id = ${req.user.id})
                        OR p.tag_id && (SELECT 
                                            ARRAY_AGG (f.following_user) 
                                        FROM 
                                            soapp.follows f 
                                        WHERE 
                                            f.user_id = ${req.user.id})
                        OR p.tag_id && (SELECT 
                                            ARRAY_AGG (u.id)
                                        FROM 
                                            soapp.users u 
                                        WHERE 
                                            u.id = ${req.user.id}));`
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

exports.post_like = async (req, res, next) => {
    console.log("like", req.body)
    try {
        const { post_id } = req.body;
        if (post_id === undefined) {
            return res.status(500).send({
                message: "Problem found to like this post"
            })
        }

        // console.log("one", req.user.id);
        const LikeList = [];
        const findUserId = await Like.findAll({
            where: {
                user_id: req.user.id,
            },
            attributes: ["post_id"]
        })
        findUserId.map((val) => {
            // console.log('Value', val.post_id);
            LikeList.push(val.post_id)
        })
        console.log("list", LikeList)

        console.log(LikeList.includes(post_id))
        if (!(LikeList.includes(post_id))) {
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
            res.json({
                data: "You already like this post"
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

exports.post_unlike = async (req, res, next) => {
    console.log("unlike", req.body)
    try {
        const { post_id } = req.body;
        if (post_id === undefined) {
            return res.status(500).send({
                message: "Problem found to unlike this post"
            })
        }

        // console.log("one", req.user.id);
        const LikeList = [];
        const findUserId = await Like.findAll({
            where: {
                user_id: req.user.id,
            },
            attributes: ["post_id"]
        })
        findUserId.map((val) => {
            // console.log('Value', val.post_id);
            LikeList.push(val.post_id)
        })
        console.log("list", LikeList)

        console.log(LikeList.includes(post_id))
        if ((LikeList.includes(post_id))) {
            const Unlilke = await Like.destroy({
                where: {
                    post_id
                }
            })
            // console.log(Unlilke)
            // console.log("UnlilkeID", Unlilke.id)   
            if (!Unlilke) {
                const error = new Error('Unlike not created!');
                error.status = 500;
                throw error;
            }
            res.json({
                data: "Unlike created successfully",
                Unlilke
            })
        } else {
            res.json({
                data: "You already unlike this post"
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

exports.create_comment = async (req, res, next) => {
    console.log("comment_create", req.body)
    // console.log("one", req.user.id)
    try {
        const { post_id, content } = req.body;
        if (post_id === undefined || content === undefined) {
            return res.status(500).send({
                message: "Problem found to create comment"
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
    console.log("comment_update", req.params, req.body);
    // console.log("one", req.user.id)
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
        const { id } = req.params
        const { content } = req.body
        if (content === undefined) {
            return res.status(500).send({
                message: "Problem found to update comment"
            })
        }

        // console.log(userComments.includes(+req.body.id))   
        if (userComments.includes(+req.params.id)) {
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
    console.log("comment_delete", req.params);
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

    const postOwner = await db.query(
        `SELECT
            c.id,
            c.user_id,
            c.post_id,
            p.user_id as post_owner_user_id
            FROM
                soapp.posts p,
                soapp.comments c
                WHERE
                    p.id = c.post_id
                    AND p.user_id = ${req.user.id};`
        , {
            type: QueryTypes.SELECT
        })
    console.log(postOwner)

    const postOwnerCommentList = []
    postOwner.map((val) => {
        postOwnerCommentList.push(val.id)
    })
    console.log(postOwnerCommentList)

    try {
        const { id } = req.params
        // console.log(userComments.includes(req.body.id))
        // console.log(postOwnerCommentList.includes(req.body.id))
        if ((userComments.includes(+req.params.id)) || (postOwnerCommentList.includes(+req.params.id))) {
            const newComment = await Comment.destroy({
                where: {
                    id
                }
            })
            console.log(newComment)
            if (!newComment) {
                const error = new Error('Delete Comment not generated!');
                error.status = 500;
                throw error;
            }
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