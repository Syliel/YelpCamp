const BaseJoi=require('joi');
const sanitizeHtml=require('sanitize-html');


//for JOI once we have our Schema defined, we pass our Data through the schema


//this is for sanitizing HTML. It might have changed. Defines an extension on joi.string called escape HTML
const extension=(joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        //JOI will call validate with whatever value it recieves
        escapeHTML: {
            validate(value, helpers) {
                const clean=sanitizeHtml(value, {
                    //sanitize html is a package npm i sanitize-html
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean!==value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi=BaseJoi.extend(extension)

module.exports.campgroundSchema=Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});


module.exports.reviewSchema=Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});