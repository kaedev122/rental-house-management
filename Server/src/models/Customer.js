import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    firstname: { type: String, require: true, index: true },
    lastname: { type: String, require: true, index: true },
    fullname: {type: String, require: true },
    name_search: {type: String, index: true },
    phone: { type: String },
    email: { type: String },
    id_number: { type: String },
    birthday: { type: Date },
    sex: {type: String },
    address: {type: String, default: '' },
    avatar: {type: String, default: '' },
    status: { type: Number, default: 1 },
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', index: true },
}, { timestamps: true, versionKey: false });

const Customer = mongoose.model('Customer', CustomerSchema);

export default Customer;