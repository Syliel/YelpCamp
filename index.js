if (process.env.NODE_ENV!=='production') {
    require('dotenv').config();
}


const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const ExpressError=require('./utils/ExpressError');
const methodOverride=require('method-override');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');

const userRoutes=require('./routes/users')
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const MongoStore=require("connect-mongo");
const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';

//dbUrl would go under connect
async function main() {
    await mongoose.connect(dbUrl, {
    });
};

const app=express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize()); //this takes care of Mongo Injection attacks!!!!

const secret=process.env.SECRET||'thisshouldbeabettersecret';

//this sessionConfig sets up the session id cookie
const sessionConfig={
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24*60*60,
        crypto: {
            secret
        },
    }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //cookies only accessible over http not javascript
        httpOnly: true,
        // secure: true, will we set this when we deploy. rn it messes things up with https
        expires: Date.now()+1000*60*60*24*7, //this prevents someone from staying logged in forever just by signing in once
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig)) //this needs to come before password.session
app.use(flash());

const scriptSrcUrls=[
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls=[
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls=[
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls=[];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dpkwd6qri/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session()); //session keeps a user logged in
passport.use(new LocalStrategy(User.authenticate())); //we would like to use the local strategy and the authentication will be located on our User model
//passport auto genertates the method authenticate

passport.serializeUser(User.serializeUser()); //how do we store a user in the session? This tells passport how. Storing
passport.deserializeUser(User.deserializeUser()); //how we get a user out of the session. Unstoring

app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo=req.originalUrl;
    }
    res.locals.currentUser=req.user;
    //this currentUser just checks to see if there's a req.user or not, which means you can set things wether you're logged in or not
    //we can use currentUser in all of our templates!!!!
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
});

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'colt@gmail.com', username: 'colttt' })
//     const newUser = await User.register(user, 'chicken')
//     res.send(newUser);
// })
//this is the basic format for using passport and I'm leaving it here as reference
//passport uses Pbkdf2 instead of bcrypt because its platform independent 

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode=500 }=err;
    if (!err.message) err.message='Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
});

app.listen(3000, () => {
    console.log("Listening on port 3000")
});

main().catch(err => console.log(err));