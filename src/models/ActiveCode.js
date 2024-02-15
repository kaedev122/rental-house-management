import mongoose from 'mongoose';

const ActiveCodeSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
    active_code: { type: String }
}, { timestamps: true, versionKey: false });

const ActiveCode = mongoose.model('ActiveCode', ActiveCodeSchema);

export default ActiveCode;