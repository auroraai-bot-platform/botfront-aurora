import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Changes } from './changes.collection';
import { checkIfCan } from '../../lib/scopes';

const maxPageSize = 100;

if (Meteor.isServer) {
    Meteor.methods(
        {
            async 'changes.find'(projectId, page, pageSize, sortField, sortDesc) {
                try {
                    checkIfCan('projects:r', projectId);
                } catch (err) {
                    return this.ready();
                }
                check(projectId, String);
                check(page, Match.Integer);
                check(pageSize, Match.Integer);
                check(sortField, String);
                check(sortDesc, Boolean);

                const checkedPageSize = pageSize > maxPageSize ? maxPageSize : pageSize;

                const sort = { [sortField]: sortDesc ? -1 : 1 };

                // return changes and total count to show correct pagination
                const result = await Changes.rawCollection().aggregate([
                    {
                        '$facet': {
                            'data': [
                                { '$match': { projectId } },
                                { '$sort': sort },
                                { '$skip': page * checkedPageSize },
                                { '$limit': checkedPageSize }
                            ],
                            'meta': [
                                { '$count': 'total' },
                                { '$addFields': { page: page, pageSize: checkedPageSize } },
                            ]
                        }
                    },
                    { '$unwind': '$meta' },
                ]).toArray();

                console.log({ result });

                return result?.[0];
            },
        },
    );
}


export const createChanges = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');

    Changes.insert({
        updatedAt: new Date(),
        environment: '',
        projectId: project._id,
        user: '',
        category: {
            item_type: 'project',
            item_sub_type: '',
            action_type: 'initialization',
        },
        item_id: '',
        before: '',
        after: '',
    });
};


export const insertChanges = (env, projectId, user, category, itemId, before, after) => {
    const hit = category;
    const categoryHit = Categories[hit];

    Changes.insert({
        updatedAt: new Date(),
        environment: env,
        category: categoryHit,
        item_id: itemId,
        user,
        projectId,
        before,
        after,
    });
};

const Categories = {
    example_add: {
        item_type: 'nlu',
        item_sub_type: 'examples',
        action_type: 'add',
    },
    example_delete: {
        item_type: 'nlu',
        item_sub_type: 'examples',
        action_type: 'delete',
    },
    example_update: {
        item_type: 'nlu',
        item_sub_type: 'examples',
        action_type: 'update',
    },
    entity_synonym_add: {
        item_type: 'nlu',
        item_sub_type: 'entity_synonym',
        action_type: 'add',
    },
    entity_synonym_delete: {
        item_type: 'nlu',
        item_sub_type: 'entity_synonym',
        action_type: 'delete',
    },
    entity_synonym_update: {
        item_type: 'nlu',
        item_sub_type: 'entity_synonym',
        action_type: 'update',
    },
    entity_gazette_add: {
        item_type: 'nlu',
        item_sub_type: 'entity_gazette',
        action_type: 'add',
    },
    entity_gazette_delete: {
        item_type: 'nlu',
        item_sub_type: 'entity_gazette',
        action_type: 'delete',
    },
    entity_gazette_update: {
        item_type: 'nlu',
        item_sub_type: 'entity_gazette',
        action_type: 'update',
    },
    regex_feature_add: {
        item_type: 'nlu',
        item_sub_type: 'regex_feature',
        action_type: 'add',
    },
    regex_feature_delete: {
        item_type: 'nlu',
        item_sub_type: 'regex_feature',
        action_type: 'delete',
    },
    regex_feature_update: {
        item_type: 'nlu',
        item_sub_type: 'regex_feature',
        action_type: 'update',
    },
    story_add: {
        item_type: 'dialogue',
        item_sub_type: 'story',
        action_type: 'add',
    },
    story_delete: {
        item_type: 'dialogue',
        item_sub_type: 'story',
        action_type: 'delete',
    },
    story_update: {
        item_type: 'dialogue',
        item_sub_type: 'story',
        action_type: 'update',
    },
    story_group_add: {
        item_type: 'dialogue',
        item_sub_type: 'story_group',
        action_type: 'add',
    },
    story_group_delete: {
        item_type: 'dialogue',
        item_sub_type: 'story_group',
        action_type: 'delete',
    },
    story_group_update: {
        item_type: 'dialogue',
        item_sub_type: 'story_group',
        action_type: 'update',
    },
};
