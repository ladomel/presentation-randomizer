const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

// IMPORT MODELS
require('./models/Thesis');
require('./models/Rating');

const app = express();

const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.OKTA_ISSUER,
  clientId: process.env.OKTA_CLIENT_ID
});

app.use(async (req, res, next) => {
  try {
    if (req.url.startsWith('/api')) {
      if (!req.headers.authorization) {
        throw new Error('Authorization header is required');
      }

      const accessToken = req.headers.authorization.trim().split(' ')[1];
      await oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default');
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