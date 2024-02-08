import mongoose, { Schema, model } from 'mongoose';

const ReportSchema: Schema = new Schema({
    id: { type: BigInt, required: true },
    type: { type: String, required: true },
    author: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' },
    resolvedBy: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
}, {
    timestamps: true
});

const ReportModel = mongoose.models.reports || model('reports', ReportSchema);

export { ReportModel, ReportSchema }