const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../config/db')
const { QueryTypes } = require('sequelize')

const User = require('../sequelize-models/User')
const Follow = require('../sequelize-models/Follow')



exports.view_profile = async (req, res, next) => {
    try {
        const user = await db.query(
            `SELECT
                    *
                FROM
                    soapp.users u
                WHERE
                    u.id = ${req.user.id};`
            , {
                type: QueryTypes.SELECT
            })

        res.status(200).json({
            message: "Profile information find successfully",
            data: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.change_password = async (req, res, next) => {
    console.log("change_password", req.body)

    const { email, password, new_password, confirm_new_password } = req.body

    if (!email || !password || !new_password || !confirm_new_password) {
        return res.status(500).send({
            message: "Some field is missing. All the field are required!"
        })
    }

    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(404).send({
                message: "Email or Password is incorrect!"
            })
        }
        const validPassword = await bcrypt.compare(password, user.password)
        if (validPassword) {
            if (new_password === confirm_new_password) {
                const salt = await bcrypt.genSalt(10)
                hashPassword = await bcrypt.hash(new_password, salt)
                const changePassword = await User.update({
                    password: hashPassword
                }, {
                    where: {
                        id: req.user.id
                    }
                })
                if (!changePassword) {
                    res.status(404).send({
                        message: "Password change failed!"
                    })
                }
                const jwtToken = jwt.sign({
                    id: user.id
                }, process.env.JWT_KEY,
                    {
                        expiresIn: "8h"
                    })

                res.status(200).json({
                    message: "Password reset successfull",
                    token: jwtToken,
                    userId: user.id
                })
                console.log(user.id)
            } else {
                return res.status(404).send({
                    message: "Password doesn't match"
                })
            }
        }
        else {
            return res.status(404).send({
                message: "Email or Password is incorrect!"
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

exports.add_profile_picture = async (req, res, next) => {
    try {
        console.log(req.file)
        if (req.file === undefined) {
            return res.status(400).send({
                message: "Image file is required!"
            })
        }
        const user = await User.update({
            profile_picture: req.file.path
        }, {
            where: {
                id: req.user.id
            }
        })
        if (!user) {
            return res.status(404).send({
                message: "Profile picture not created!"
            })
        }
        res.status(200).json({
            message: "Profile picture updated successfully"
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.users_update = async (req, res, next) => {
    // console.log(req.user.id)
    try {
        const { first_name, last_name, date_of_birth, gender } = req.body
        const user = await User.update({
            first_name, last_name, date_of_birth, gender
        }, {
            where: {
                id: req.user.id
            }
        })
        if (!user) {
            return res.status(404).send({
                message: "User info not updated!"
            })
        }
        res.status(200).json({
            message: "User info updated successfully"
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_userlist = async (req, res, next) => {
    // console.log(req.user.id)
    try {
        const user = await db.query(
            `SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.gender,
                u.profile_picture
            FROM 
                soapp.users u;`
            , {
                type: QueryTypes.SELECT
            })

        // const user = await db.query(
        //     `SELECT
        //         u.id,
        //         u.first_name,
        //         u.last_name,
        //         u.gender,
        //         u.profile_picture
        //     FROM
        //         soapp.users u
        //     WHERE
        //         u.id NOT IN (SELECT
        //             f.following_user 
        //             FROM 
        //                 soapp.follows f 
        //                 WHERE 
        //                     f.user_id = ${req.user.id}
        //                     OR u.id = ${req.user.id});`
        //     , {
        //         type: QueryTypes.SELECT
        //     })

        // // console.log(user.length)
        // if (user.length == 0) {
        //     return res.status(404).json("users not found!")
        // }

        res.status(200).json({
            message: "All users find successfully",
            data: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_follower_userlist = async (req, res, next) => {
    // console.log(req.user.id)
    try {
        const user = await db.query(
            `SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.gender,
            u.profile_picture
            FROM 
                soapp.follows f,
                soapp.users u
                WHERE 
                    u.id = f.user_id
                    AND f.following_user = ${req.user.id};`
            , {
                type: QueryTypes.SELECT
            })

        // console.log(user.length)
        if (user.length == 0) {
            return res.status(404).json("users not found!")
        }

        res.status(200).json({
            message: "Follower users find successfully",
            data: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_following_userlist = async (req, res, next) => {
    // console.log(req.user.id)
    try {
        const user = await db.query(
            `SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.gender,
                u.profile_picture
            FROM
                soapp.users u
            WHERE
                u.id IN (SELECT
                    f.following_user 
                    FROM 
                        soapp.follows f 
                        WHERE 
                            f.user_id = ${req.user.id});`
            , {
                type: QueryTypes.SELECT
            })

        // console.log(post.length)
        if (user.length == 0) {
            return res.status(404).json("Following users not found!")
        }

        res.status(200).json({
            message: "Following users find successfully",
            data: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.users_follow = async (req, res, next) => {
    console.log("follow", req.body)
    try {
        const { following_user } = req.body
        if (!following_user) {
            return res.status(400).send({
                message: "following user id is required!"
            })
        }
        // console.log("one", req.user.id);
        const FollowList = [];
        const findUserId = await Follow.findAll({
            where: {
                user_id: req.user.id,
            },
            attributes: ["following_user"]
        })
        findUserId.map((val) => {
            // console.log('Value', val.following_user);
            FollowList.push(val.following_user)
        })
        console.log("list", FollowList)

        // console.log(FollowList.includes(following_user))
        if (FollowList.includes(following_user)) {
            res.status(404).json({
                message: "You already follow this user"
            })
        } else {
            const newFollow = await Follow.create({
                user_id: req.user.id,
                following_user
            })
            // console.log(newFollow)
            // console.log("newFollowID", newFollow.id)

            if (!newFollow) {
                return res.status(404).send({
                    message: "Follow not generated!"
                })
            }

            res.status(200).json({
                message: "New Follow generated successfully",
                data: newFollow
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

exports.users_unfollow = async (req, res, next) => {
    console.log("unfollow", req.body)
    try {
        const { following_user } = req.body
        if (!following_user) {
            return res.status(500).send({
                message: "following user id is required!"
            })
        }
        // console.log("one", req.user.id);
        const unfollow = await Follow.destroy({
            where: {
                following_user,
                user_id: req.user.id
            }
        })

        if (unfollow == 0) {
            return res.status(404).send({
                message: "This user is not in your following list!!"
            })
        }

        res.status(200).json({
            message: "Unfollow generated successfully",
            data: unfollow
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_followers = async (req, res, next) => {
    // console.log("two", req.user)
    // console.log("three", req.user.id)

    try {
        const followers = await db.query(
            `SELECT
                COUNT (f.following_user) AS followers
                FROM 
                    soapp.follows f
                    WHERE 
                        f.following_user = ${req.user.id};`
            , {
                type: QueryTypes.SELECT
            })

        res.status(200).json({
            message: "Followers counted successfully",
            data: followers
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_following_users = async (req, res, next) => {
    // console.log("two", req.user)
    // console.log("three", req.user.id)

    try {
        const following_users = await db.query(
            `SELECT
                COUNT (f.user_id) AS following_users
                FROM 
                    soapp.follows f
                    WHERE 
                        f.user_id = ${req.user.id};`
            , {
                type: QueryTypes.SELECT
            })

        res.status(200).json({
            message: "Following Users counted successfully",
            data: following_users
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}