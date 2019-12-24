const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = new Schema({
    type: String, // PRESENTATION, THESIS

    thesis_id: String,
    user: String,
    rating: Number
});

mongoose.model('rating', productSchema);