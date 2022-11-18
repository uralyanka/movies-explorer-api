const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/validationError');
const ConflictError = require('../errors/conflictError');
const { secretKey } = require('../utils/config');

require('dotenv').config();

module.exports.getCurrentUser = (req, res, next) => {
  // console.log('Я внутри функции getCurrentUser');
  User.findById(req.user._id)
    .then((user) => res.send({ name: user.name, email: user.email }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        email,
        password: hash,
      })
        .then((user) => {
          res.send(
            {
              message: '200 - Пользователь успешно зарегистрирован',
              _id: user._id,
              name: user.name,
              email: user.email,
            },
          );
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictError('409 - Пользователь c таким email уже существует'));
            return;
          }
          if (err.name === 'ValidationError') {
            next(new ValidationError('400 - Переданы некорректные данные'));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

module.exports.updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => res.send({
      _id: user._id,
      name: user.name,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('409 - Пользователь c таким email уже существует'));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new ValidationError('400 - Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, secretKey, { expiresIn: '7d' });
      // console.log('qweqwe = ', secretKey);
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.send({ name: user.name, email, token });
    })
    .catch(next);
};

module.exports.signout = (req, res) => {
  res.cookie('jwt', 'token').send({ message: 'Вы вышли из аккаунта' });
};
