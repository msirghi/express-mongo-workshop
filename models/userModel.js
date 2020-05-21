const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [ true, 'Please, specify your name' ]
  },
  email: {
    type: String,
    required: [ true, 'Please, specify your email' ],
    unique: true,
    lowercase: true,
    validate: [ validator.isEmail, 'Please, provide a valid email' ]
  },
  photo: String,
  role: {
    type: String,
    enum: [ 'user', 'guide', 'lead-guide', 'admin' ],
    default: 'user'
  },
  password: {
    type: String,
    required: [ true, 'Please, specify your password' ],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [ true, 'Please, confirm your password' ],
    validate: {
      // only on save
      validator: function (el) {
        return el === this.password
      }
    },
    message: 'Passwords do not match'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    return jwtTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }

  return false;
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
