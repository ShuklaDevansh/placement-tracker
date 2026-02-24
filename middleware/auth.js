const jwt = require('jsonwebtoken')

const authenticate = (req,res,next) => {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // No token provided
    if (!token){
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.',
            code: 'NO_TOKEN'
        });
    }

    //Verify token
    jwt.verify(token,process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            const message = err.name === 'TokenExpiredError'
            ? 'Token has expired. Please log in again.'
            : 'Invalid token.';
            
            return res.status(401).json({
                success: false,
                error: message,
                code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED': 'INVALID_TOKEN'
            });
        }

        //Attach decoded user to request
        req.user = decoded;
        next();
    });
};

module.exports = authenticate;