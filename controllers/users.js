const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
};

module.exports.registerUser = async (req, res, next) => {
    //this will take the form data and register a new user
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); //this is passport and will salt and hash password
        req.login(registeredUser, err => { //req.login will log them in after registering... we unforunately need to add the err
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }

};

module.exports.loginPage = (req, res) => {
    res.render('users/login')
};

module.exports.login = (req, res) => {
    //this authenticate middleware basically takes care of logging in for us... it will make sure the user exists and return either true or false and direct or send an error flash
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
            res.redirect('/campgrounds')
        }
    });
    req.flash('success', 'Come back soon!');
    res.redirect('/campgrounds')
}