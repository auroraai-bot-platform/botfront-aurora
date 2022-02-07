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
        category: {item_type: 'project',
            item_sub_type: '',
            action_type: 'initialization'},
        item_id: '',
        before: '',
        after: '',
        });
};


export const insertChanges = (env, project_id, user, category, item_id, before, after) => {

    var hit = category
    const category_hit = Categories[hit]

    Changes.insert({
        updatedAt: new Date(),
        environment: env,
        projectId: project_id,
        user: user,
        category: category_hit,
        item_id: item_id,
        before: before,
        after: after,
        });
};

const Categories = {
    'example_add':{
        'item_type':'nlu',
        'item_sub_type':'examples',
        'action_type':'add'
    },
    'example_delete':{
        'item_type':'nlu',
        'item_sub_type':'examples',
        'action_type':'delete'
    },
    'example_update':{
        'item_type':'nlu',
        'item_sub_type':'examples',
        'action_type':'update'
    }
}