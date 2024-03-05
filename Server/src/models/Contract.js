import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
    status: { type: Number, default: 1 },
    note: { type: String },
    date_start: { type: Date, require: true },
    date_end: { type: Date, require: true },
    deposit_money: { type: Number, default: 0 },

    water_total: { type: Number, default: 0 },
    electric_total: { type: Number, default: 0 },
    room_price: { type: Number, require: true },
    other_costs: [{
        name: String,
        price: Number,
        number: Number
    }],

    customer_represent: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
    customer: [{type: mongoose.Schema.Types.ObjectId, ref: 'Customer'}],
    room: {type: mongoose.Schema.Types.ObjectId, ref: 'Room'}
}, { timestamps: true, versionKey: false });

const Contract = mongoose.model('Contract', ContractSchema);

export default Contract;