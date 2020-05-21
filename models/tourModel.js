const mongoose = require('mongoose');
const slugify = require('slugify')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    maxlength: [40, 'A tour name must have less than 40 characters'],
    minlength: [10, 'A tour name must have more than 10 characters'],
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  slug: String,
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating should be above 1.0'],
    max: [5, 'Rating should be below 5.0']
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
    // with custom validator. Works only on document creation.
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      // {VALUE} === val
      message: 'Discount price ({VALUE}) should be below the regular price'
    }
  },
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// virtual prop
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// document middleware. Before save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// query middleware. All operations which star with 'find'
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// aggregation  middleware.
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took: ${ Date.now() - this.start } mls`);
  next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
