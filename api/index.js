const path = require('path');

// Set CWD to server/ so relative paths in the server code resolve correctly
process.chdir(path.resolve(__dirname, '..', 'server'));

// The app is defined inside server/ so all require() calls resolve
// dependencies from server/node_modules (where Vercel installs them).
module.exports = require('../server/vercelApp');
