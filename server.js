//server.js becomes the entry point
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app'); //app exported from app.js

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
