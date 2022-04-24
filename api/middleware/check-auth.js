const jwt = require('jsonwebtoken')

const AuthorizedUser = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new Error("Not authenticated.");
        error.flag = true;
        error.statusCode = 401;
        return next(error);
    }
    const token = authHeader.split(" ")[1];

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
        if (error.message === "jwt expired") {
            error.message = "Session Expired";
        }
        error.statusCode = 500;
        return next(error);
    }

    if (!decodedToken) {
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        return next(error);
    }

    req.user = decodedToken;
    // console.log("decoded!", decodedToken)
    return next();
};

module.exports = AuthorizedUser;
