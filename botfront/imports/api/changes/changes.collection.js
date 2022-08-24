import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ChangesSchema } from './changes.schema';
import { checkIfCan } from '../../lib/scopes';

export const Changes = new Mongo.Collection('changes');

const expireAfter30days = 60 * 60 * 24 * 30;


Changes.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

if (Meteor.isServer) {
    Changes.createIndex({ updatedAt: 1 }, { expireAfterSeconds: expireAfter30days });
    Changes.createIndex({ projectId: 1 });

    Meteor.publish('changes', function (projectId) {
        try {
            checkIfCan('projects:r', projectId);
        } catch (err) {
            return this.ready();
        }
        check(projectId, String);
        return Changes.find({ projectId });
    });
}

Changes.attachSchema(ChangesSchema);
