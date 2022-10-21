const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/notFoundError');
const ValidationError = require('../errors/validationError');
const ConflictError = require('../errors/conflictError');

require('dotenv').config();

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
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
            next(new ValidationError('400 - Переданы некорректные данные при создании пользователя'));
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
    { new: true, runValidators: true})
    .then((user) => res.send({
      _id: user._id,
      name: user.name,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('400 - Переданы некорректные данные при обновлении профиля'));
        return;
      }
      next(err);
    });
};


const { NODE_ENV, JWT_SECRET } = process.env;
const secretKey = NODE_ENV === 'production' ? JWT_SECRET : 'secret-key';

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
      res.send({ token });
    })
    .catch(next);
};

module.exports.signout = (req, res) => {
  res.cookie('jwt', 'token', {
    maxAge: -1,
    httpOnly: true,
  });
  res.status(200)
    .send({ message: 'Вы вышли из аккаунта' });
};
