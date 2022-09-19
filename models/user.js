const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); //this is going to add on to our schema a username/password and make sure they're unique and give us methods
//this means we only have to specify email in the UserSchema

module.exports = mongoose.model('User', UserSchema);