import mongoose, { Schema, model } from 'mongoose';

const UserSchema: Schema = new Schema({
    id: { type: String, required: true },
    owner: { type: Boolean, required: false, default: false },
    admin: { type: Boolean, required: false, default: true },
    moderator: { type: Boolean, required: false, default: true },
    banned: { type: Boolean, required: false, default: false },
    verified: { type: Boolean, required: false, default: false },
    beta: { type: Boolean, required: false, default: false },
    active_domain: { type: String, required: false, default: 'none' },
    domains: [
        {
            name: { type: String, required: true },
            txtContent: { type: String, required: true, default: null, unique: true },
            verified: { type: Boolean, required: false, default: false },
        }
    ]
});

const UserModel = mongoose.models.cordxUsers || model('cordxUsers', UserSchema);

export { UserModel, UserSchema }