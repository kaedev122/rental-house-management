import mongoose from 'mongoose';

const ApartmentSchema = new mongoose.Schema({
    name: {type: String, require: true },
    name_search: {type: String },
    phone: {type: String },
    address: {type: String, require: true },
    location: {type: String },
    status: {type : Number, default: 1},
    water_price: {type : Number, default: 0},
    electric_price: {type : Number, default: 0},
    other_price: [{
        name: String,
        price: Number
    }],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
}, { timestamps: true, versionKey: false });

const Apartment = mongoose.model('Apartment', ApartmentSchema);

export default Apartment;