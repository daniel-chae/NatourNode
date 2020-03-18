const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    //tpye, required, unique, trim, maxlength, minlength, min, max, enum, default, validate, select
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //lecture 107 - validator
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must not exceed 40 characters'], //lecture 107 - validator for string
      minlength: [10, 'A tour name must be longer than 10 characters'] //lecture 107 - validator for string
      // validate: [validator.isAlpha, 'Tour name must only contain characters'] //lecture 108 - validation using external library
    },
    slug: {
      type: String
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'], //lecture 107 - validator for string with pre-defined options
        message: 'Difficulty must be either: easy, medium, difficult' //lecture 107 - validator for string with pre-defined options
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], //lecture 107 - validator for number or dates
      max: [5, 'Rating must be below 5.0'] //lecture 107 - validator for number or dates
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      //lecture 108 custom validator for non-supported validation
      validate: {
        validator: function(val) {
          // this only points to current doc on New document creation. It does not work with document update for example.
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regualr price' //message will have access to the value with curly braces {VALUE}
      }
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      trim: true
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  //optional configuration. Here it defines if virtual property will be added or not.
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// lecture 103 - add virtual property
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//lecture 104 - document middleware
//Mongoose document middleware
//Callback function is called before a document is saved and pass next as argument
//runs before .save() and .create() but *not before .insertMany()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  //'this' points to the current document being processed.
  //saving a new property called 'slug' and use slugify package to create it. Pre-requisite is to have slug property in schema
  next(); //next is called to proceed to the next middleware
});

//lecture104
//multiple middlewares can run
tourSchema.pre('save', function(next) {
  next(); //if next is not used, document creation will get stuck
});

//lecture 104
//Callback function is called after a document is saved.
//It has access to the created document and next arguments
tourSchema.post('save', function(doc, next) {
  next();
});

//lecture 105 - query middleware
//Before Tour.find() runs it filters out the secret tours
//tourSchema.pre('find', function(next) { -> issue with this code is that it doesn't run for findOne() or other find method.
//we use regular expression for this middleware to be applied on any find method
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }); //this for query middleware is not the document but the query object
  // this.start = Date.now();
  next();
});

//lecture 105 - query middleware
tourSchema.post(/^find/, function(docs, next) {
  // console.log(`Query took ${Date.now() - this.start} miliseconds`);
  // console.log(docs);
  next();
});

//lecture 106 - aggregation middleware
//If we want to exclude secret tour from all aggregation, then better to do it in schema level than doing it for each controller
tourSchema.pre('aggregate', function(next) {
  //'this' points to aggregation object
  //agrregation object has pipeline() function that returns array given where Tour.aggregate() is used.
  //We just have to add a new object at the beginning of the array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
