const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../sequelize-models/User')
const Follow = require('../sequelize-models/Follow')

const { Op } = require("sequelize")



exports.users_signup = async (req, res, next) => {
    console.log("users_register", req.body);
    const { email, password, first_name, last_name, date_of_birth, gender, profile_picture } = req.body;
    if (email === undefined || password === undefined || first_name === undefined || last_name === undefined || date_of_birth === undefined || gender === undefined) {
        return res.status(500).send({
            message: "Something went wrong!"
        })
    }
    const salt = await bcrypt.genSalt(10);
    hashPassword = await bcrypt.hash(password, salt);
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
            const error = new Error('User not created!');
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

    console.log("users_login", req.body);

    const { email, password } = req.body;

    if (email === undefined || password === undefined) {
        return res.status(500).send({
            message: "Something went wrong!!!"
        });
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
            });
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
    // console.log(req.body.id)
    // console.log(req.user.id)

    if (req.user.id === req.body.id) {
        try {
            const { id, first_name, last_name, date_of_birth, gender, profile_picture } = req.body;

            const user = await User.update({
                first_name, last_name, date_of_birth, gender, profile_picture
            }, {
                where: {
                    id
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

exports.users_viewAll = async (req, res, next) => {
    // console.log(req.user.id)
    try {
        const userAll = await User.findAll({
            attributes: ['id', 'first_name', 'last_name', 'date_of_birth', 'gender', 'profile_picture'],
            where: {
                id: {
                    [Op.ne]: req.user.id
                }
            }
        })

        res.json({
            data: "All users find successfully",
            userAll
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
        const { following_user } = req.body;
        if (following_user === undefined) {
            return res.status(500).send({
                message: "Found problem to follow"
            })
        }

        // if ((UserFollowMapping[0].user_id.includes(req.user.id)) && (UserFollowMapping[0].follow_id.includes(following))) {
        //     return res.status(403).json("You already follow this user")
        // }
        // else {

        // }

        // console.log(req.user.id)
        if (req.user.id) {
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