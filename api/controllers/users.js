const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../config/db')
const { QueryTypes } = require('sequelize')

const User = require('../sequelize-models/User')
const Follow = require('../sequelize-models/Follow')
const PasswordReset = require('../sequelize-models/ResetPassword')

const nodeMailer = require('nodemailer')





exports.users_signup = async (req, res, next) => {
    console.log("users_register", req.body)
    const { email, password, first_name, last_name, date_of_birth, gender, profile_picture } = req.body
    if (email === undefined || password === undefined || first_name === undefined || last_name === undefined || date_of_birth === undefined || gender === undefined) {
        return res.status(500).send({
            message: "Something went wrong!"
        })
    }
    const salt = await bcrypt.genSalt(10)
    hashPassword = await bcrypt.hash(password, salt)
    try {
        const newUser = await User.create({
            email: email,
            password: hashPassword,
            first_name: first_name,
            last_name: last_name,
            date_of_birth: date_of_birth,
            gender: gender,
            profile_picture: profile_picture
        })
        // console.log("new", newUser)

        if (!newUser) {
            const error = new Error('User not created!')
            error.status = 500;
            throw error;
        }
        else {
            console.log(newUser);
            res.status(200).json({
                data: "User registered successfully", newUser
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

exports.users_login = async (req, res, next) => {

    console.log("users_login", req.body)

    const { email, password } = req.body

    if (email === undefined || password === undefined) {
        return res.status(500).send({
            message: "Something went wrong!!!"
        })
    }

    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            const error = new Error('Email or Password is incorrect!')
            error.status = 405
            throw error
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (validPassword) {
            const jwtToken = jwt.sign({
                id: user.id
            }, process.env.JWT_KEY,
                {
                    expiresIn: "8h"
                })

            res.status(200).json({
                data: "User login successfull",
                token: jwtToken,
                userId: user.id
            })
            console.log(user.id)
        }
        else {
            return res.status(401).send({
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

exports.forgot_password = async (req, res, next) => {
    console.log("forgot_password", req.body)

    const { email } = req.body

    if (email === undefined) {
        return res.status(500).send({
            message: "Something went wrong!!!"
        })
    }

    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(401).send({
                message: "User does not exist"
            })
        }
        else {
            const token = Math.random().toString(20).substring(2, 12)
            const passwordReset = await PasswordReset.create({
                email,
                token
            })
            if (!passwordReset) {
                return res.status(401).send({
                    message: "Password reset not created"
                })
            }
            const transporter = nodeMailer.createTransport({
                service: "gmail",
                auth: {
                    user: "v2.shezan@gmail.com",
                    pass: "shezan.v2@123"
                }
            })
            const link = `https://soapp-nodejs.herokuapp.com/users/reset-password/${token}/${email}`
            let mailOptions = {
                from: 'v2.shezan@gmail.com',
                to: email,
                subject: 'Reset your password',
                html: `<body> Click <a href="${link}"> here </a> to reset your password! </body>`
            }
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    return res.status(401).send({
                        message: "Link not sent"
                    })
                }
                else {
                    res.status(200).json({
                        message: "Check your email to reset your password"
                    })
                }
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

exports.reset_password = async (req, res, next) => {
    const { new_password, confirm_new_password } = req.body
    const { token, email } = req.params

    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(401).send({
                message: "User does not exist"
            })
        }
        const passResetToken = await PasswordReset.findOne({
            where: {
                token
            }
        })
        if (!passResetToken) {
            return res.status(401).send({
                message: "Token not found!"
            })
        }
        else {
            if (new_password === confirm_new_password) {
                const salt = await bcrypt.genSalt(10)
                hashPassword = await bcrypt.hash(new_password, salt)
                const updatedPassword = await User.update({
                    password: hashPassword
                }, {
                    where: {
                        email
                    }
                })
                res.status(200).json({
                    message: "Password recover successfull"
                })
            } else {
                return res.status(401).send({
                    message: "Password doesn't match"
                })
            }
        }
        await PasswordReset.destroy({
            where: {
                email
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_profile = async (req, res, next) => {
    try {
        if (req.user.id) {
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
            if (!user) {
                const error = new Error('Problem found to view profile');
                error.status = 500;
                throw error;
            }
            res.json({
                data: "Profile information find successfully",
                user
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

exports.change_password = async (req, res, next) => {
    console.log("change_password", req.body)

    const { id, email, password, new_password, confirm_new_password } = req.body

    if (email === undefined || password === undefined) {
        return res.status(500).send({
            message: "Something went wrong!!!"
        })
    }

    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(401).send({
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
                        id
                    }
                })
                const jwtToken = jwt.sign({
                    id: user.id
                }, process.env.JWT_KEY,
                    {
                        expiresIn: "8h"
                    })

                res.status(200).json({
                    data: "Password reset successfull",
                    token: jwtToken,
                    userId: user.id
                })
                console.log(user.id)
            } else {
                return res.status(401).send({
                    message: "Password doesn't match"
                })
            }
        }
        else {
            return res.status(401).send({
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
        if (req.user.id) {
            if (req.file === undefined) {
                return res.status(500).send({
                    message: "Problem found to add profile picture"
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
                const error = new Error('Profile picture not created!');
                error.status = 500;
                throw error;
            }
            res.json({
                message: "Profile picture updated successfully"
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

exports.users_update = async (req, res, next) => {
    // console.log(req.params.id)
    // console.log(req.user.id)
    if (req.user.id) {
        try {
            const { first_name, last_name, date_of_birth, gender } = req.body
            const user = await User.update({
                first_name, last_name, date_of_birth, gender
            }, {
                where: {
                    id: req.user.id
                }
            })
            res.json({
                message: "User info updated successfully"
            })
        } catch (error) {
            return res.status(500).json(err)
        }
    }
    else {
        return res.status(403).json("Permision denied")
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
                soapp.users u
            WHERE
                u.id NOT IN (SELECT
                    f.following_user 
                    FROM 
                        soapp.follows f 
                        WHERE 
                            f.user_id = ${req.user.id}
                            OR u.id = ${req.user.id});`
            , {
                type: QueryTypes.SELECT
            })

        // console.log(post.length)
        if (!user) {
            const error = new Error('Problem found to view users');
            error.status = 500;
            throw error;
        }
        if (user.length === 0) {
            return res.status(403).json("users not found!")
        }

        res.json({
            data: "All users find successfully",
            user
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
        if (!user) {
            const error = new Error('Problem found to view following users');
            error.status = 500;
            throw error;
        }
        if (user.length === 0) {
            return res.status(403).json("Following users not found!")
        }

        res.json({
            data: "Following users find successfully",
            user
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
        if (following_user === undefined) {
            return res.status(500).send({
                message: "Found problem to follow this user"
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
            res.json({
                data: "You already follow this user"
            })
        } else {
            const newFollow = await Follow.create({
                user_id: req.user.id,
                following_user
            })
            // console.log(newFollow)
            // console.log("newFollowID", newFollow.id)

            if (!newFollow) {
                const error = new Error('Follow not generated!');
                error.status = 500;
                throw error;
            }

            res.json({
                data: "New Follow generated successfully",
                newFollow
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
        if (following_user === undefined) {
            return res.status(500).send({
                message: "Problem found to unfollow this user"
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
            const unfollow = await Follow.destroy({
                where: {
                    following_user
                }
            })
            // console.log(unfollow)
            // console.log("unfollowID", unfollow.id)   
            if (!unfollow) {
                const error = new Error('Unfollow not generated!');
                error.status = 500;
                throw error;
            }
            res.json({
                data: "New Unfollow generated successfully",
                unfollow
            })
        } else {
            res.json({
                data: "You already unfollow this user"
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