import { Schema, models, model } from 'mongoose';
import { ErrorSchema } from '../types/client';

const CordXErrorSchema = new Schema<ErrorSchema>({
    state: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    info: { type: String, required: true },
    reportId: { type: String, required: true },
    reporter: { type: String, required: true },
    error: { type: Object, required: true },
    resolvedAt: { type: String, required: false },
    ignoredAt: { type: String, required: false },
}, { timestamps: true });

const CordXErrors = models.cordxErrors || model('cordxErrors', CordXErrorSchema);

export { CordXErrors, CordXErrorSchema };