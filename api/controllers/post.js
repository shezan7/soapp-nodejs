const db = require('../config/db')
const { QueryTypes } = require('sequelize')

const Post = require('../sequelize-models/Post')
const Like = require('../sequelize-models/Like')
const Comment = require('../sequelize-models/Comment')



exports.create_post = async (req, res, next) => {
    console.log("post_create", req.body)
    // console.log("two", req.user)
    // console.log("three", req.user.id)

    try {
        const { content, tag_id } = req.body
        if (!content) {
            return res.status(500).send({
                message: "Content is required!"
            })
        }

        const newPost = await Post.create({
            content,
            // picture: req.file.filename,
            user_id: req.user.id,
            tag_id
        })

        // console.log(newPost)
        // console.log("newPostID", newPost.id)   
        if (!newPost) {
            return res.status(404).send({
                message: "Post not created!"
            })
        }
        res.status(200).json({
            message: "New Post created successfully",
            data: newPost
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.upload_image_to_post = async (req, res, next) => {
    console.log("post_id", req.params.post_id)
    console.log("upload_image", req.file)
    // console.log("two", req.user)
    // console.log("three", req.user.id)
    try {
        if (req.file === undefined) {
            return res.status(400).send({
                message: "Image file is required!"
            })
        }
        const post = await Post.update({
            picture: req.file.path
        }, {
            where: {
                id: req.params.post_id,
                user_id: req.user.id
            }
        })
        // console.log(post)
        // console.log("postID", post.id)   
        if (post == 0) {
            return res.status(404).send({
                message: "Sorry, this is not your post!"
            })
        }
        res.status(200).json({
            message: "Image upload successfully",
            data: post
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

// exports.get_upload_image = async (req, res, next) => {
//     console.log("post_id", req.params.post_id)
//     // console.log("two", req.user)
//     // console.log("three", req.user.id)
//     try {
//         if (req.user.id) {
//             const post = await Post.findOne({
//                 where: {
//                     id: req.params.post_id
//                 }
//             })

//             // console.log(post)
//             // console.log("postID", post.id)   
//             if (!post) {
//                 const error = new Error('Image not found!');
//                 error.status = 500;
//                 throw error;
//             }
//             res.json({
//                 data: "Image find successfully",
//                 post
//             })
//         } else {
//             return res.status(403).json("Sorry, You are not eligible")
//         }
//     }

//     catch (err) {
//         console.log(err)
//         res.status(500).json({
//             error: err
//         })
//     }
// }

exports.update_post = async (req, res, next) => {
    console.log("post_update", req.params.id, req.body.content)
    // console.log("one", req.user.id)
    try {
        const { id } = req.params
        const { content } = req.body
        if (!content) {
            return res.status(400).send({
                message: "Content is required!"
            })
        }
        const newPost = await Post.update({
            content
            // picture: req.file.filename
        }, {
            where: {
                id,
                user_id: req.user.id
            }
        })
        // console.log(newPost)
        // console.log("newPostID", newPost.id)   
        if (newPost == 0) {
            return res.status(404).send({
                message: "Sorry, this is not your post!"
            })
        }
        res.status(200).json({
            message: "Post updated successfully",
            data: newPost
        })
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
    try {
        const { id } = req.params
        // console.log("one", req.user.id);
        const newPost = await Post.destroy({
            where: {
                id,
                user_id: req.user.id
            }
        })
        if (newPost == 0) {
            return res.status(404).send({
                message: "Sorry, this is not your post!"
            })
        }
        // console.log(newPost)
        // console.log("newPostID", newPost.id)
        res.status(200).json({
            message: "Post deleted successfully",
            data: newPost
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_post = async (req, res, next) => {
    // console.log("two", req.user)
    // console.log("three", req.user.id)

    try {
        const post = await db.query(
            `SELECT
                    p.id,
                    p.content,
                    p.picture,
                    p.tag_id,
                    u.first_name,
                    u.last_name,
                    u.id as user_id,
                    COUNT (l.user_id) AS total_like
                FROM
                    soapp.users u,
                    soapp.posts p
                    LEFT JOIN soapp.likes l ON p.id = l.post_id
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
                                            u.id = ${req.user.id}))
                GROUP BY 
                    p.id, 
                    u.first_name, 
                    u.last_name,
                    u.id;`
            , {
                type: QueryTypes.SELECT
            })

        // console.log(post.length)
        if (post.length == 0) {
            return res.status(404).json("Post is not found!")
        }

        res.status(200).json({
            message: "Post found successfully",
            data: post
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.post_like_unlike = async (req, res, next) => {
    console.log("like", req.body)
    try {
        const { post_id } = req.body
        if (!post_id) {
            return res.status(500).send({
                message: "Post id is required!"
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
                return res.status(404).send({
                    message: "Like not created!"
                })
            }
            res.status(200).json({
                message: "Like created successfully",
                data: newLike
            })
        } else {
            const Unlilke = await Like.destroy({
                where: {
                    post_id
                }
            })
            // console.log(Unlilke)
            // console.log("UnlilkeID", Unlilke.id)   
            if (!Unlilke) {
                return res.status(404).send({
                    message: "Unlike not created!"
                })
            }
            res.status(200).json({
                message: "Unlike created successfully",
                data: Unlilke
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

// exports.post_like = async (req, res, next) => {
//     console.log("like", req.body)
//     try {
//         const { post_id } = req.body
//         if (!post_id) {
//             return res.status(500).send({
//                 message: "Post is missing which you want to like"
//             })
//         }

//         // console.log("one", req.user.id);
//         const LikeList = [];
//         const findUserId = await Like.findAll({
//             where: {
//                 user_id: req.user.id,
//             },
//             attributes: ["post_id"]
//         })
//         findUserId.map((val) => {
//             // console.log('Value', val.post_id);
//             LikeList.push(val.post_id)
//         })
//         console.log("list", LikeList)

//         console.log(LikeList.includes(post_id))
//         if (!(LikeList.includes(post_id))) {
//             const newLike = await Like.create({
//                 user_id: req.user.id,
//                 post_id
//             })
//             // console.log(newLike)
//             // console.log("newLikeID", newLike.id)   
//             if (!newLike) {
//                 return res.status(404).send({
//                     message: "Like not created!"
//                 })
//             }
//             res.status(200).json({
//                 message: "Like created successfully",
//                 data: newLike
//             })
//         } else {
//             res.status(404).json({
//                 message: "You already like this post"
//             })
//         }
//     }

//     catch (err) {
//         console.log(err)
//         res.status(500).json({
//             error: err
//         })
//     }
// }

// exports.post_unlike = async (req, res, next) => {
//     console.log("unlike", req.body)
//     try {
//         const { post_id } = req.body
//         if (!post_id) {
//             return res.status(400).send({
//                 message: "Post is missing which you want to unlike"
//             })
//         }

//         // console.log("one", req.user.id);
//         const LikeList = [];
//         const findUserId = await Like.findAll({
//             where: {
//                 user_id: req.user.id,
//             },
//             attributes: ["post_id"]
//         })
//         findUserId.map((val) => {
//             // console.log('Value', val.post_id);
//             LikeList.push(val.post_id)
//         })
//         console.log("list", LikeList)

//         console.log(LikeList.includes(post_id))
//         if ((LikeList.includes(post_id))) {
//             const Unlilke = await Like.destroy({
//                 where: {
//                     post_id
//                 }
//             })
//             // console.log(Unlilke)
//             // console.log("UnlilkeID", Unlilke.id)   
//             if (!Unlilke) {
//                 return res.status(404).send({
//                     message: "Unlike not created!"
//                 })
//             }
//             res.status(200).json({
//                 message: "Unlike created successfully",
//                 data: Unlilke
//             })
//         } else {
//             res.status(404).json({
//                 message: "You already unlike this post"
//             })
//         }
//     }

//     catch (err) {
//         console.log(err)
//         res.status(500).json({
//             error: err
//         })
//     }
// }

// exports.total_like = async (req, res, next) => {
//     // console.log("two", req.user);
//     // console.log("three", req.user.id);

//     // const user_id = req.user.id

//     try {
//         const { post_id } = req.params
//         const totalLike = await db.query(
//             `SELECT
//                     COUNT (l.user_id) AS total_like
//                 FROM 
//                     soapp.likes l,
//                     soapp.posts p
//                 WHERE 
//                     p.id = l.post_id
//                     AND p.id = ${post_id};`
//             , {
//                 type: QueryTypes.SELECT
//             })

//         // console.log(totalLike.length)
//         if (!totalLike) {
//             return res.status(404).send({
//                 message: "Problem found to view total like!"
//             })
//         }
//         res.status(200).json({
//             message: "Total like counted successfully",
//             data: totalLike
//         })
//     }

//     catch (err) {
//         console.log(err)
//         res.status(500).json({
//             error: err
//         })
//     }
// }

exports.create_comment = async (req, res, next) => {
    console.log("comment_create", req.body)
    // console.log("one", req.user.id)
    try {
        const { post_id, content } = req.body
        if (!post_id || !content) {
            return res.status(400).send({
                message: "Content and Post id are required!"
            })
        }

        const newComment = await Comment.create({
            user_id: req.user.id,
            post_id,
            content
        })
        // console.log(newComment)
        // console.log("newCommentID", newComment.id)   
        if (!newComment) {
            return res.status(404).send({
                message: "Comment not created!"
            })
        }
        res.status(200).json({
            message: "Comment created successfully",
            data: newComment
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_comment = async (req, res, next) => {
    // console.log("two", req.user)
    // console.log("three", req.user.id)

    try {
        const { post_id } = req.params
        const comment = await db.query(
            `SELECT 
                c.*, 
                u.first_name, 
                u.last_name
            FROM 
                soapp.comments c, 
                soapp.users u 
            WHERE 
                u.id = c.user_id
                AND c.post_id = ${post_id};`
            , {
                type: QueryTypes.SELECT
            })

        // console.log(comment.length)
        if (comment.length == 0) {
            return res.status(404).json("Comment is not found!")
        }

        res.status(200).json({
            message: "Comment found successfully",
            data: comment
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.update_comment = async (req, res, next) => {
    console.log("comment_update", req.params, req.body)
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
        if (!content) {
            return res.status(400).send({
                message: "Content is required!"
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
            if (!newComment) {
                return res.status(404).send({
                    message: "Update comment not generated!"
                })
            }
            res.status(200).json({
                message: "Comment updated successfully",
                data: newComment
            })
        } else {
            return res.status(401).json("Sorry, You are not eligible")
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
    console.log("comment_delete", req.params)
    // console.log("one", req.user.id)
    const userComments = []
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
                return res.status(404).send({
                    message: "Delete comment not generated!"
                })
            }
            res.status(200).json({
                message: "Comment deleted successfully",
                data: newComment
            })
        } else {
            return res.status(401).json("Sorry, You are not eligible")
        }
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}