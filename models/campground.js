const mongoose=require('mongoose');
const Review=require('./review');
const Schema=mongoose.Schema;


const opts={ toJSON: { virtuals: true } };

const CampgroundSchema=new Schema({
    title: String,
    images: [{
        url: String,
        filename: String
    }],
    geometry: { //this is GeoJSON. Type must be enum of POINT 
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: { //coordinates is an array of numbers
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId, //this adds an author to the schema with an objectId referecing the user schema
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, //this adds reviews from the review schema or review.js under
            ref: 'Review'
        }
    ],
}, opts);

CampgroundSchema.path('images').schema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200/');
});

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>` //substring sets from 0 to 20 characters and shortens the description
    //this gives an anchor tag to the virtual properties that sends you to that particular campsite
});

//this is a query middleware that passes in the document to the function
//this middleware is to delete reviews on campgrounds, because currently if you delete a campground the reviews remain
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            //remove the id somewhere *in* document.reviews
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('Campground', CampgroundSchema);