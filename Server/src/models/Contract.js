import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
    note: { type: String },
    code: {type: String},
    date_start: { type: Date, require: true },
    date_end: { type: Date, require: true },
    deposit_money: { type: Number, default: 0 },
    
    water_price: { type: Number, default: 0 },
    electric_price: { type: Number, default: 0 },
    room_price: { type: Number, require: true },
    
    other_price: [{
        name: String,
        price: Number,
        number: Number
    }],
    total_other_price: {type : Number, default: 0},
    
    status: { type: Number, default: 1 },
    customer_represent: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
    customers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Customer'}],
    room: {type: mongoose.Schema.Types.ObjectId, ref: 'Room', index: true},
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', index: true}
}, { timestamps: true, versionKey: false });

const Contract = mongoose.model('Contract', ContractSchema);

export default Contract;