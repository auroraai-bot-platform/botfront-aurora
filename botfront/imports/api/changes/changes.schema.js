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
    category: Object,
    'category.item_type': { type: String, optional: true },
    'category.item_sub_type': { type: String, optional: true },
    'category.action_type': { type: String, optional: true },
    item_id: {
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
