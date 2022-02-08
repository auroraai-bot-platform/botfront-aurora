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
    },
    'entity_synonym_add':{
        'item_type':'nlu',
        'item_sub_type':'entity_synonym',
        'action_type':'add'
    },       
    'entity_synonym_delete':{
        'item_type':'nlu',
        'item_sub_type':'entity_synonym',
        'action_type':'delete'
    },    
    'entity_synonym_update':{
        'item_type':'nlu',
        'item_sub_type':'entity_synonym',
        'action_type':'update'
    },
    'entity_gazette_add':{
        'item_type':'nlu',
        'item_sub_type':'entity_gazette',
        'action_type':'add'
    },       
    'entity_gazette_delete':{
        'item_type':'nlu',
        'item_sub_type':'entity_gazette',
        'action_type':'delete'
    },    
    'entity_gazette_update':{
        'item_type':'nlu',
        'item_sub_type':'entity_gazette',
        'action_type':'update'
    },
    'regex_feature_add':{
        'item_type':'nlu',
        'item_sub_type':'regex_feature',
        'action_type':'add'
    },       
    'regex_feature_delete':{
        'item_type':'nlu',
        'item_sub_type':'regex_feature',
        'action_type':'delete'
    },    
    'regex_feature_update':{
        'item_type':'nlu',
        'item_sub_type':'regex_feature',
        'action_type':'update'
    },
    'story_add':{
        'item_type':'dialogue',
        'item_sub_type':'story',
        'action_type':'add'
    },       
    'story_delete':{
        'item_type':'dialogue',
        'item_sub_type':'story',
        'action_type':'delete'
    },    
    'story_update':{
        'item_type':'dialogue',
        'item_sub_type':'story',
        'action_type':'update'
    },
    'story_group_add':{
        'item_type':'dialogue',
        'item_sub_type':'story_group',
        'action_type':'add'
    },       
    'story_group_delete':{
        'item_type':'dialogue',
        'item_sub_type':'story_group',
        'action_type':'delete'
    },    
    'story_group_update':{
        'item_type':'dialogue',
        'item_sub_type':'story_group',
        'action_type':'update'
    }             
}

