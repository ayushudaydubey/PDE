
const fs = require('fs');
const errorMiddleware = (err, req, res, next) => {
  try {
    fs.appendFileSync('error.log', new Date().toISOString() + ' - ' + err.stack + '\n\n');
  } catch(e) {}
  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = errorMiddleware;