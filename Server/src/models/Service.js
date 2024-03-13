import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    name: {type: String, require: true },
    name_search: {type: String},
    price: {type: Number, default: 0 },
    status: {type: Number, default: 1},
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', index: true},
}, { timestamps: true, versionKey: false });

const Service = mongoose.model('Service', ServiceSchema);

export default Service;