const { campgroundSchema, reviewSchema }=require('./schemas.js');
const ExpressError=require('./utils/ExpressError');
const Campground=require('./models/campground');
const Review=require('./models/review');
const baseRoute=require('./utils/baseRoute')||'/';

module.exports.isLoggedIn=(req, res, next) => {
    if (!req.isAuthenticated()) { //this verifies if the person is signed in, again, thanks to passport!
        //store the url they are requesting!
        // if (!req.isAuthenticated()) { //this verifies if the person is signed in, again, thanks to passport!
        req.flash('error', 'You must be signed in first');
        return res.redirect(`${baseRoute}login`);
    }
    next();
};

module.exports.validateCampground=(req, res, next) => {
    const { error }=campgroundSchema.validate(req.body)
    if (error) {
        const msg=error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.isAuthor=async (req, res, next) => {
    const { id }=req.params;
    const campground=await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`${baseRoute}campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor=async (req, res, next) => {
    const { id, reviewId }=req.params;
    const review=await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`${baseRoute}campgrounds/${id}`);
    }
    next();
};



module.exports.validateReview=(req, res, next) => {
    const { error }=reviewSchema.validate(req.body)
    if (error) {
        const msg=error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};