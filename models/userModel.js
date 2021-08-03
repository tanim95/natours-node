const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: [true, 'Please provide your email'],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // so the password will never show to the user.
  },
  passwordconfirm: {
    type: String,
    required: true,
    validate: {
      // reminder:this validation only works on 'save' or "create".
      validator: function (doc) {
        return doc === this.password;
      },
      message: 'Password did not matched!',
    },
  },
  photo: String,
});

userSchema.pre('save', async function (next) {
  //this line below only runs if the password is modified.
  if (!this.isModified('password')) return next();
  // hashing the pass with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // deleting passwordconfirm field
  this.passwordconfirm = undefined;
  next();
});
// IT IS AN 'INSTANCE' WHICH IS AVAILABLE FOR ALL THE DOCUMNET IN A CERTAIN COLLECTION.
userSchema.methods.comparePass = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};

const User = mongoose.model('user', userSchema);
module.exports = User;
