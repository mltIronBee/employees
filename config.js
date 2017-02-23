module.exports = {
  "apiPrefix": "http://" + process.env.API_HOST || 'localhost' + ":" + process.env.API_PORT || 8080,
  "serverPort": process.env.API_PORT || 8080,
  "dbConfig": {
    "name": "test",
    "host": "localhost",
    "port": 27017
  }
};