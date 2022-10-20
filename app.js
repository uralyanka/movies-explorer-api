require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { errors } = require('celebrate');
const NotFoundError = require('./errors/notFoundError');
const auth = require('./middlewares/auth');

const errorsHandler = require('./middlewares/errorsHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017');

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('/', require('./routes'));

app.use(auth);
app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.all('/*', (req, res, next) => {
  next(new NotFoundError('Неправильный путь'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
