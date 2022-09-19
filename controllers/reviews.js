const Review = require('../models/review')
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; //sets the review to the author after creating the review
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created New Review!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    //this is destructured so that we do not need to call req.params after ever instance of id and reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) //from review array where we have the reviewId
    //this uses the $pull operator in mongo which removes from an existing array all instances of a value or values that match a specified condition
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted!')
    res.redirect(`/campgrounds/${id}`);
}