const mongoose=require('mongoose');
const cities=require('./cities')
const { places, descriptors }=require('./seedHelpers')
const Campground=require('../models/campground');

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    });
};

main().catch(err => console.log(err));

const sample=array => array[Math.floor(Math.random()*array.length)];

const seedDB=async () => {
    await Campground.deleteMany({});
    for (let i=0; i<400; i++) {
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            //YOUR USER ID
            author: '631a2b35976368bb29f09719',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "It's a campground. I can't believe how campgroundy it is. Whatever will we do if this campground campgrounds less next year? I guess we will have to find some other place to use as a campground. Maybe a campground? I don't know. I guess that's kinda a cool thought. I'm rambling so this description can look all professional and stuff, but it's really just me being weird as usual. K, thanks.",
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude, //we are taking longitude and latitude from our random1000 on our cities.js file in seeds
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dpkwd6qri/image/upload/v1662744863/YelpCamp/vg45w7tjbmnvcimamhcg.jpg',
                    filename: 'YelpCamp/vg45w7tjbmnvcimamhcg',
                },
                {
                    url: 'https://res.cloudinary.com/dpkwd6qri/image/upload/v1662744863/YelpCamp/vtofzd9fczhopn1bzvhg.jpg',
                    filename: 'YelpCamp/vtofzd9fczhopn1bzvhg',
                }
            ]
        })
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
})