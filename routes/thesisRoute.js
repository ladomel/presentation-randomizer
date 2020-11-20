const mongoose = require('mongoose');
const Thesis = mongoose.model('thesis');
const Rating = mongoose.model('rating');

module.exports = (app) => {

  app.get(`/api/thesis`, async (req, res) => {
    let theses = await Thesis.find();

    for (let i = 0; i < theses.length; i++) {
      let ratings = await Rating.find({thesis_id: theses[i]['_id']});

      let temp = JSON.parse(JSON.stringify(theses[i]));
      temp.ratings = ratings;
      theses[i] = temp;
    }

    return res.status(200).send(theses);
  });

  app.post(`/api/thesis`, async (req, res) => {
    req.body['author'] = req.userData.email;
    req.body['author_name'] = req.userData.name;
    let thesis = await Thesis.create(req.body);
    return res.status(201).send({
      success: true,
      thesis
    })
  });

  app.put(`/api/thesis/:id`, async (req, res) => {
    const {id} = req.params;

    let thesis = await Thesis.findByIdAndUpdate(id, req.body);

    return res.status(202).send({
      success: true,
      thesis
    })

  });

  app.delete(`/api/thesis/:id`, async (req, res) => {
    const {id} = req.params;

    await Rating.deleteMany({thesis_id: id});
    let thesis = await Thesis.findByIdAndDelete(id);

    return res.status(202).send({
      success: true,
      thesis
    })

  });

};