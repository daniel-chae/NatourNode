const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//type, required, default, unique, trim, maxLength, minLength, lowercase
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    select: false,
    // lecture126 managing passwords
    // validation only works on create & save!! We should be careful with update opration. findOneAndUpdate shouldn't be used.
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: 'Passwords are not the same!!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

// lecture126 encrypt the password
// define a middleware to run after request and before save
userSchema.pre('save', async function(next) {
  // only do this when password is changed.
  // this is document being processed and has a method isModified.
  if (!this.isModified('password')) return next();
  // bcrypt.hash takes two arguments. First string to hash, second salt to add to the password.
  // the higher the number the higher it is be CPU intensive. 12 is standard nowadays.
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now();
  // we do not want to store passwordConfirm to database. It was just used for validation.
  this.passwordConfirm = null; //even if passwordConfirm is required field, it still works. It is simply required input.
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex'); //create a random string

  // hash the random string
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // set expiry time for the token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
