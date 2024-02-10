import mongoose, { Schema, model } from 'mongoose';
import { UserData } from '../types/user';
import { UserDomainSchema } from './UserDomains';
import { UserSignatureSchema } from './SignatureSchema';

const UserSchema = new Schema<UserData>({
    id: { type: Number, required: true },
    userId: { type: String, required: true },
    owner: { type: Boolean, required: false, default: false },
    admin: { type: Boolean, required: false, default: true },
    moderator: { type: Boolean, required: false, default: true },
    support: { type: Boolean, required: false, default: true },
    developer: { type: Boolean, required: false, default: false },
    banned: { type: Boolean, required: false, default: false },
    verified: { type: Boolean, required: false, default: false },
    beta: { type: Boolean, required: false, default: false },
    active_domain: { type: String, required: false, default: 'none' },
    domains: [UserDomainSchema],
    signature: UserSignatureSchema
});

const UserModel = mongoose.models.cordxUsers || model('cordxUsers', UserSchema);

export { UserModel, UserSchema }