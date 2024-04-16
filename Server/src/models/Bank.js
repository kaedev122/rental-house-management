import mongoose from 'mongoose';

const BankSchema = new mongoose.Schema({
    name: {type: String},
    short_name: {type: String},
    code: {type: String},
    bin: {type: String},
    logo: {type: String},
}, { timestamps: true, versionKey: false });

const Bank = mongoose.model('Bank', BankSchema);

export default Bank;