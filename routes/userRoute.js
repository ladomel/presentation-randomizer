const mongoose = require('mongoose');
const User = mongoose.model('user');

module.exports = (app) => {

    app.get(`/api/users`, async (req, res) => {
        return res.status(200).send(await User.find());
    });

};