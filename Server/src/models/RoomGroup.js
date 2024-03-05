import mongoose from 'mongoose';

const RoomGroupSchema = new mongoose.Schema({
    name: {type: String, require: true},
    name_search: {type: String, require: true},
    status: {type : Number, default: 1},
    apartment: {type: mongoose.Schema.Types.ObjectId, ref: 'Apartment'},
}, { timestamps: true, versionKey: false });

const RoomGroup = mongoose.model('RoomGroup', RoomGroupSchema);

export default RoomGroup;