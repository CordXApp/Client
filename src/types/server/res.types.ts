export const RootSchema = {
    200: {
        type: 'object',
        properties: {
            message: { type: 'string' },
            version: { type: 'string' },
            documentation: { type: 'string' },
            status: { type: 'string' },
            code: { type: 'number' }
        }
    }
}