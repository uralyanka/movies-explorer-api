const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Вы превысили 200 запросов за 15 минут!',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
