import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {type: String, require: true, unique: true, index: true },
    password: {type: String, require: true },
    status: {type: Number, default: 0 },
    email: {type: String, index: true, require: true },
    phone: {type: String },
    birthday: {type: Date },
    sex: {type: String },
    avatar: {type: String, default: '' },
    fullname: {type: String, require: true },
    name_search: {type: String },
    address: {type: String, default: '' },
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', UserSchema);

export default User;