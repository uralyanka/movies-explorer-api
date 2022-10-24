const { NODE_ENV, JWT_SECRET, HOST_BD } = process.env;

module.exports.mongodb = NODE_ENV === 'production' ? HOST_BD : 'mongodb://localhost:27017/moviesdb';
module.exports.secretKey = NODE_ENV === 'production' ? JWT_SECRET : 'secret-key';
