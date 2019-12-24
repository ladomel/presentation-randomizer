const mongoose = require('mongoose');
const Rating = mongoose.model('rating');

module.exports = (app) => {

    app.post(`/api/rating`, async (req, res) => {
        let rating = await Rating.find({
            type: req.body.type,
            thesis_id: req.body.thesis_id,
            user: req.body.user,
        });
        if (rating.length > 0) {
            rating = await Rating.findByIdAndUpdate(rating[0]['_id'], req.body);
        } else {
            rating = await Rating.create(req.body);
        }
        return res.status(201).send({
            success: true,
            rating
        })
    });

};