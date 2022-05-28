const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const nodeMailer = require('nodemailer')

const User = require('../sequelize-models/User')
const PasswordReset = require('../sequelize-models/ResetPassword')



exports.users_signup = async (req, res, next) => {
    console.log("users_register", req.body)
    const { email, password, first_name, last_name, date_of_birth, gender, profile_picture } = req.body
    if (!email || !password || !first_name || !last_name || !date_of_birth || !gender) {
        return res.status(400).send({
            message: "Some field is missing. All the field are required!"
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
            return res.status(500).send({
                message: "User not created!"
            })
        }
        else {
            console.log(newUser);
            res.status(200).json({
                message: "User registered successfully",
                data: newUser
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

    if (!email || !password) {
        return res.status(400).send({
            message: "Email and Password are required!!!"
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
            const jwtToken = jwt.sign({
                id: user.id
            }, process.env.JWT_KEY,
                {
                    expiresIn: "8h"
                })

            res.status(200).json({
                message: "User login successfull",
                token: jwtToken,
                userId: user.id
            })
            console.log(user.id)
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

exports.forgot_password = async (req, res, next) => {
    console.log("forgot_password", req.body)

    const { email } = req.body

    if (!email) {
        return res.status(400).send({
            message: "Email is required!"
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
                return res.status(404).send({
                    message: "Password reset not created"
                })
            }
            const transporter = nodeMailer.createTransport({
                service: "gmail",
                port: 465,
                secure: true,
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
                    console.log(err)
                    res.status(404).send({
                        message: "Link not sent"
                    })
                    PasswordReset.destroy({
                        where: {
                            email
                        }
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
    const { email, token, new_password, confirm_new_password } = req.body

    if (!email || !token || !new_password || !confirm_new_password) {
        res.status(500).send({
            message: "Some field is missing. All the field are required!"
        })
        await PasswordReset.destroy({
            where: {
                email
            }
        })
    }
    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) {
            res.status(404).send({
                message: "User does not exist"
            })
            await PasswordReset.destroy({
                where: {
                    email
                }
            })
        }
        const passResetToken = await PasswordReset.findOne({
            where: {
                token
            }
        })
        if (!passResetToken) {
            res.status(404).send({
                message: "Token not found!"
            })
            await PasswordReset.destroy({
                where: {
                    email
                }
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
                if (!updatedPassword) {
                    res.status(404).send({
                        message: "Password recover failed!"
                    })
                }
                res.status(200).json({
                    message: "Password recover successfull"
                })
                await PasswordReset.destroy({
                    where: {
                        email
                    }
                })
            } else {
                res.status(404).send({
                    message: "Password doesn't match"
                })
                await PasswordReset.destroy({
                    where: {
                        email
                    }
                })
            }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
        await PasswordReset.destroy({
            where: {
                email
            }
        })
    }
}