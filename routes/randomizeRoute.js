const mongoose = require('mongoose');
const mailUtil = require('../util/mailUtil');
const Thesis = mongoose.model('thesis');
const Rating = mongoose.model('rating');

// https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    let m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

module.exports = (app) => {

    app.post(`/api/randomize`, async (req, res) => {
        let users = req.body.users.map(i => i.email);
        let theses = await Thesis.find();

        let data = [];
        for (let thesis of theses) {
            if (!thesis.presenter) {
                let ratings = await Rating.find({thesis_id: thesis['_id']});

                data.push({
                    author: thesis.author,
                    rating: ratings.length > 0 ? ratings.reduce((a, b) => a + b.rating, 0)/ratings.length : 0,
                    thesis_id: thesis['_id'],
                    thesis_desc: thesis.description
                });
            }
        }

        data.sort(function(a, b) {return b.rating - a.rating});

        users = shuffle(users);
        let usersLeft = JSON.parse(JSON.stringify(users));
        for (let user of users) {
            for (let i = 0; i < data.length; i++) {
                if (!data[i].presenter /* && data[i].author !== user */) {
                    data[i].presenter = user;

                    for (let u of req.body.users) {
                        if (u.email === user) {
                            data[i].presenter_name = u.name;
                            break;
                        }
                    }

                    usersLeft.splice(usersLeft.indexOf(user), 1);
                    break;
                }
            }
        }

        for (let user of usersLeft) {
            for (let i = 0; i < data.length; i++) {
                if (!data[i].presenter ) {
                    data[i].presenter = user;
                    break;
                }
            }
        }

        data = data.filter(item => item.presenter);

        // save changes
        for (let item of data) {
            await Thesis.findByIdAndUpdate(item.thesis_id, {
                presenter: item.presenter,
                presenter_name: item.presenter_name
            });
        }

        // send mails
        for (let i of data) {
            mailUtil.sendEmail(i.presenter, "Presentation", 'Your Thesis: ' + i.thesis_desc);
        }

        return res.status(200).send({
            success: true,
            data
        })
    });

};
