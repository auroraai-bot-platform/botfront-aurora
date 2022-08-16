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
        type: String,
    },
    user: {
        type: String,
        optional: true,
    },
    itemType: {
        type: String,
        optional: true,
    },
    itemSubType: {
        type: String,
        optional: true,
    },
    actionType: {
        type: String,
        optional: true,
    },
    itemId: {
        type: String,
        optional: true,
    },
    itemName: {
        type: String,
        optional: true,
    },
    before: {
        type: String,
        optional: true,
    },
    after: {
        type: String,
        optional: true,
    },

}, { tracker: Tracker });
