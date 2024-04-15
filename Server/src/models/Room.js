import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
    name: {type: String, require: true},
    name_search: {type: String, require: true},
    code_room: {type: String, require: true, index: true},
    status: {type : Number, default: 1},
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'RoomGroup'},
    room_price: {type: Number, default: 0},
    water_price: { type: Number, default: 0 },
    electric_price: { type: Number, default: 0 },
    images: [{type: String}],
    
    customer_represent: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
    contract: {type: mongoose.Schema.Types.ObjectId, ref: 'Contract'},
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', index: true},
}, { timestamps: true, versionKey: false });

const Room = mongoose.model('Room', RoomSchema);

export default Room;