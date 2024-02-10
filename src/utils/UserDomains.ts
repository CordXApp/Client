import { Schema } from 'mongoose';
import { CustomDomains } from '../types/user';

export const UserDomainSchema = new Schema<CustomDomains>({
    name: { type: String, required: true },
    txtContent: { type: String, required: true },
    verified: { type: Boolean, required: true },
}, { timestamps: true });