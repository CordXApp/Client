import { Schema } from 'mongoose';
import { UserSignature } from '../types/user';

export const UserSignatureSchema = new Schema<UserSignature>({
    key: { type: String, required: true },
}, { timestamps: true });