const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 


const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    console.log(token);
    if (!token) {
         return res.redirect(process.env.REDIRECT_URL || '/');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect('/');
        }
        req.user = decoded;  
        next(); 
    });
};

module.exports = authenticateJWT;
