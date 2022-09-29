const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    v0: {
        type: Number,
        required: true,
    },

    vMax: {
        type: Number,
        required: true,
    },

    vMax: {
        type: Number,
        required: true,
    },

    distance: {
        type: Number,
        required: true,
    },

    t0: {
        type: Number,
        required: true,
    },

    t1: {
        type: Number,
        required: false,
        default: 'Not existed for first string'
    },
})

module.exports = mongoose.model('data', dataSchema)