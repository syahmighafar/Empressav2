const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const string = {
    type: String,
}

const runnerpodSchema  = new mongoose.Schema({
    pod_id: string,
    podSequence: {type: Number},
    madeby: string,
    deliveryArea: string,
    agentName: string,
    deliveryDate: string,
    podstatus: string,
    numbers: {type: [String]},
    trackingNumber: {type: [String]},
    contactName: {type: [String]},
    contactNumber: {type: [String]},
    contactAddress: {type: [String]},
    parcelValue: {type: [String]},
    paymentMethod: {type: [String]},
    deliveryType: {type: [String]},
})

module.exports = mongoose.model('runner_pods', runnerpodSchema)