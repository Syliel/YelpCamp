const express = require('express');
const router = express.Router();
const passport = require('passport')
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const baseRoute=require('../utils/baseRoute')||'/';

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.loginPage)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: `${baseRoute}login`, keepSessionInfo: true }), users.login);

router.get('/logout', users.logout);

module.exports = router;