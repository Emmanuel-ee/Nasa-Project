const mongoose = require('mongoose')

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        required: true,
        type: Number,
        // default: 100,
        // min: 100,
        // max: 999,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    mission: {
        type: String,
        required: true
    },
    rocket: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        // required: true
    },
    customers: [ String ],
    upcoming: {
        type: Boolean,
        required: true
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    },
})

//Connects launchesSchema with the launches collection
module.exports = mongoose.model('Launch', launchesSchema)