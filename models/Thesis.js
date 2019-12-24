const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = new Schema({
    author: String,
    author_name: String,
    title: String,
    description: String,

    status: String,

    presenter: String,
    presenter_name: String,
    presentation_date: Date
});

mongoose.model('thesis', productSchema);