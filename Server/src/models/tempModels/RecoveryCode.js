import mongoose from 'mongoose';

const RecoveryCodeSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
    recovery_code: { type: String }
}, { timestamps: true, versionKey: false });

const RecoveryCode = mongoose.model('RecoveryCode', RecoveryCodeSchema);

export default RecoveryCode;