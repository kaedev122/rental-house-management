import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
    status: { type: Number, default: 1 },
    code: {type: String},
    note: { type: String },
    water_number: { type: Number, require: true },
    electric_number: { type: Number, require: true },
    water_total: { type: Number, default: 0 },
    water_price: { type: Number, default: 0 },
    electric_price: { type: Number, default: 0 },
    electric_total: { type: Number, default: 0 },
    water_used: { type: Number },
    electric_used: { type: Number },
    last_water_number: { type: Number, require: true },
    last_electric_number: { type: Number, require: true },
    room_price: { type: Number, require: true },
    other_price: [{
        name: String,
        price: Number,
        number: Number
    }],
    total_other_price: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    cost_incurred: { type: Number, default: 0 },
    debt: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    payment_status: { type: Number, default: 0 },
    
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment'},
    contract: {type: mongoose.Schema.Types.ObjectId, ref: 'Contract'},
    room: {type: mongoose.Schema.Types.ObjectId, ref: 'Room'}
}, { timestamps: true, versionKey: false });

const Bill = mongoose.model('Bill', BillSchema);

export default Bill;