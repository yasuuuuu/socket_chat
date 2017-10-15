const path = require('path');

module.exports = {
  entry: './src/js/chat_ui.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public/js')
  }
};
