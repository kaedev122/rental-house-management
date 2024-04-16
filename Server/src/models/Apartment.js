import mongoose from 'mongoose';

const ApartmentSchema = new mongoose.Schema({
    name: {type: String, require: true },
    name_search: {type: String },
    phone: {type: String },
    address: {type: String, require: true },
    location: {
        longitude: {type: String},
        latitude: {type: String},
    },
    status: {type : Number, default: 1},
    water_price: {type : Number, default: 0},
    electric_price: {type : Number, default: 0},
    images: [{type: String}],
    bank_info: {
        bank_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Bank'},
        account_number: {type: String},
        account_name: {type: String},
    },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
}, { timestamps: true, versionKey: false });

const Apartment = mongoose.model('Apartment', ApartmentSchema);

export default Apartment;