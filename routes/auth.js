const express = require('express');
const router = express.Router();
const {registerUser, loginUser, getMe} = require('../services/authService');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const authenticate = require('../middleware/auth');

//POST /api/auth/register
router.post('/register', validateRegister, async (req,res,next) => {
    try{
        const { name,email,password } = req.body;
        const result = await registerUser(name, email, password);
        res.status(201).json({
            success: true,
            data: result
        });
    } catch(error) {
        next(error);
    }
});

//POST /api/auth/login
router.post('/login', validateLogin, async (req,res,next) => {
    try{
        const {email,password } = req.body;
        const result = await loginUser( email, password);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch(error) {
        next(error);
    }
});

//GET /api/auth/me
router.get('/me',authenticate,async(req,res,next) => {
    try{
        const user = await getMe(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch(error) {
        next(error);
    }
});

module.exports = router;