import mongoose from 'mongoose';

const PaidSchema = new mongoose.Schema({
    money: {type: Number, default: 0},
    bill: {type: mongoose.Schema.Types.ObjectId, ref: 'Bill'},
    day: {type: Number},
    month: {type: Number},
    year: {type: Number},
    contract:  {type: mongoose.Schema.Types.ObjectId, ref: 'Contract'},
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment'},
}, { timestamps: true, versionKey: false });

const Paid = mongoose.model('Paid', PaidSchema);

export default Paid;