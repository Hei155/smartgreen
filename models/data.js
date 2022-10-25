const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    tr: {
        type: Number,
        required: true,
    },

    tt: {
        type: Number,
        required: true,
    },

    tp: {
        type: Number,
        required: true,
    },

    ar: {
        type: Number,
        required: true,
    },

    at: {
        type: Number,
        required: true,
    },
    
    us: {
        type: Number,
        required: true,
    },

    usPas: {
        type: Number,
        required: true,
    },

    consum: {
        type: Number,
        required: true,
    },

})

module.exports = mongoose.model('data', dataSchema)