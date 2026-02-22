const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    userObj.role = userObj.role || 'MEMBER';

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: userObj,
        },
    });
};

exports.signup = async (req, res) => {
    try {
        const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role,
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password!' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getMe = async (req, res) => {
    const user = req.user;
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    userObj.role = userObj.role || 'MEMBER';

    res.status(200).json({
        status: 'success',
        data: {
            user: userObj,
        },
    });
};
