import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { safeLoad, safeDump } from 'js-yaml';
import { formatError } from '../../lib/utils';
import { Changes } from './changes.collection';
import { checkIfCan } from '../../lib/scopes';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';


export const createChanges = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');

    Changes.insert({
        updatedAt: new Date(),
        environment: '',
        projectId: project._id,
        user: '',
        category: 'initialization',
        item_id: '',
        before: '',
        after: '',
        });
};


export const insertChanges = (env, project_id, user, category, item_id, before, after) => {

    Changes.insert({
        updatedAt: new Date(),
        environment: env,
        projectId: project_id,
        user: user,
        category: category,
        item_id: item_id,
        before: before,
        after: after,
        });
};