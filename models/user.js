const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: [2, 'Имя должно быть длиннее 2х символов, сейчас его длина {VALUE} символ(ов)'],
    maxlength: [30, 'Имя должно быть короче 30ти символов, сейчас его длина {VALUE} символ(ов)'],
  },
});

module.exports = mongoose.model('user', userSchema);