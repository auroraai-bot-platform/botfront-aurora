import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ChangesSchema } from './changes.schema';
import { checkIfCan } from '../../lib/scopes';

export const Changes = new Mongo.Collection('changes');

if (Meteor.isServer) {
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
