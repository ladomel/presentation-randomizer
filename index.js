const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {OAuth2Client} = require('google-auth-library');
require('dotenv/config');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

// IMPORT MODELS
require('./models/Thesis');
require('./models/Rating');
require('./models/User');

const User = mongoose.model('user');

const app = express();

console.log(process.env.CLIENT_ID)
const client = new OAuth2Client(process.env.CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID
  });
  return ticket.getPayload();
}

app.use(async (req, res, next) => {
  try {
    if (req.url.startsWith('/api') && !(req.url === '/api/thesis' && req.method === 'GET')) {
      if (!req.headers.authorization) {
        throw new Error('Authorization header is required');
      }

      const token = req.headers.authorization.trim().split(' ')[1];
      const user = await verify(token);
      if (user && user.email) {
        req.userData = {
          email: user.email,
          name: user.name
        }

        let existingUser = await User.find({email: user.email});
        if (existingUser.length == 0) {
          await User.create(req.userData);
        }
      } else {
        throw new Error('Couldn\'t identify user');
      }
    }
    next();
  } catch (error) {
    next(error.message);
  }
});

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

app.use(bodyParser.json());

//IMPORT ROUTES
require('./routes/thesisRoute')(app);
require('./routes/userRoute')(app);
require('./routes/ratingRoute')(app);
require('./routes/randomizeRoute')(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req,res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })

}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`)
});