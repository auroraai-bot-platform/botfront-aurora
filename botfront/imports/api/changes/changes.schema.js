import SimpleSchema from 'simpl-schema';

export const ChangesSchema = new SimpleSchema({
    updatedAt: {
        type: Date,
        optional: true,
    },
    environment: {
        type: String,
        optional: true,
    },
    projectId: {
        type: String 
    },
    user: {
        type: String,
        optional: true
    },
    category: {
        type: String,
        optional: true
    },
    item_id: {
        type: String,
        optional: true
    },        
    before: {
        type: String,
        optional: true
    },
    after: {
        type: String,
        optional: true
    },    

}, { tracker: Tracker });
