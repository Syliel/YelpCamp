const Campground=require('../models/campground');
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary }=require('../cloudinary');

module.exports.index=async (req, res) => {
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index', { campgrounds }) //the curly brackets here acutally render the campgrounds to the page
}

module.exports.renderNewForm=(req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCamp=async (req, res, next) => {
    const geoData=await geocoder.forwardGeocode({
        query: req.body.campground.location,
        //this is the body of campgroundSchema the location part
        limit: 1
    }).send()
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground=new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    //the geometry we defined in the Schema, geodata from mapbox and its features
    campground.images=req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author=req.user._id; //req.user is auto added in. this will save the author id when a campground is made
    await campground.save();
    console.log(campground);
    req.flash('success', 'Succesfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCamp=async (req, res) => {
    const campground=await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author' //nested populate populate reviews and then their author and then the author on the campground :V
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Campground Not Found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.editCamp=async (req, res) => {
    const campground=await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Campground Not Found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCamp=async (req, res) => {
    const { id }=req.params;
    const campground=await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs=req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        //pull from the images array all images where the filename is in the req.body.deleteImages array
        console.log(campground)
    };
    req.flash('success', 'Updated Campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCamp=async (req, res) => {
    const { id }=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Removed')
    res.redirect('/campgrounds');
}