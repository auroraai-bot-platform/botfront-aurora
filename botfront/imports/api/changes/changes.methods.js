import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Changes } from './changes.collection';
import { checkIfCan } from '../../lib/scopes';

const maxPageSize = 100;

if (Meteor.isServer) {
    Meteor.methods(
        {
            // method to fetch change log data
            // includes sorting, filtering and pagination
            async 'changes.find'(projectId, page, pageSize, sortField, sortDesc, filters) {
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
                check(filters, Array);

                // custom filter functions, e.g. for date ranges
                const filterFunctions = {
                    updatedAt: (value) => {
                        try {
                            const { start, end } = JSON.parse(value);
                            return { $gte: new Date(start), $lte: new Date(end) };
                        } catch {
                            return {};
                        }
                    },
                    default: (value) => {
                        return { $regex: `^${value}.*` };
                    },
                };

                const checkedPageSize = pageSize > maxPageSize ? maxPageSize : pageSize;

                const sort = { [sortField]: sortDesc ? -1 : 1 };

                const findQuery = filters.reduce((acc, curr) => {
                    acc[curr.id] = filterFunctions[curr.id] ? filterFunctions[curr.id](curr.value) : filterFunctions.default(curr.value);
                    return acc;
                }, { projectId });



                // return changes and total count to show correct pagination
                try {
                    const result = await Changes.rawCollection().aggregate([
                        {
                            '$facet': {
                                'data': [
                                    { '$match': findQuery },
                                    { '$sort': sort },
                                    { '$skip': page * checkedPageSize },
                                    { '$limit': checkedPageSize },
                                    {
                                        '$addFields': {
                                            updatedAt: {
                                                '$dateToString': {
                                                    'format': '%Y-%m-%d %H:%M:%S',
                                                    'date': '$updatedAt',
                                                },
                                            },
                                        },
                                    },
                                ],
                                'meta': [
                                    { '$count': 'total' },
                                    { '$addFields': { page: page, pageSize: checkedPageSize } },
                                ],
                            },
                        },
                        { '$unwind': '$meta' },
                    ]).toArray();

                    if (result?.[0]) {
                        return result?.[0];
                    }
                } catch (error) {
                    console.error({ error });
                }

                return {
                    data: [],
                    meta: {
                        count: 0,
                        page: 0,
                        pageSize: checkedPageSize,
                    },
                };
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
        itemType: 'project',
        itemSubType: '',
        actionType: 'initialization',
        itemId: '',
        before: '',
        after: '',
    });
};


export const insertChanges = (env, projectId, user, category, itemId, itemName, before, after) => {
    const hit = category;
    const categoryHit = Categories[hit];

    Changes.insert({
        updatedAt: new Date(),
        environment: env,
        category: categoryHit,
        itemId,
        itemName,
        user,
        projectId,
        before,
        after,
        ...categoryHit,
    });
};

const Categories = {
    example_add: {
        itemType: 'nlu',
        itemSubType: 'examples',
        actionType: 'add',
    },
    example_delete: {
        itemType: 'nlu',
        itemSubType: 'examples',
        actionType: 'delete',
    },
    example_update: {
        itemType: 'nlu',
        itemSubType: 'examples',
        actionType: 'update',
    },
    entity_synonym_add: {
        itemType: 'nlu',
        itemSubType: 'entity_synonym',
        actionType: 'add',
    },
    entity_synonym_delete: {
        itemType: 'nlu',
        itemSubType: 'entity_synonym',
        actionType: 'delete',
    },
    entity_synonym_update: {
        itemType: 'nlu',
        itemSubType: 'entity_synonym',
        actionType: 'update',
    },
    entity_gazette_add: {
        itemType: 'nlu',
        itemSubType: 'entity_gazette',
        actionType: 'add',
    },
    entity_gazette_delete: {
        itemType: 'nlu',
        itemSubType: 'entity_gazette',
        actionType: 'delete',
    },
    entity_gazette_update: {
        itemType: 'nlu',
        itemSubType: 'entity_gazette',
        actionType: 'update',
    },
    regex_feature_add: {
        itemType: 'nlu',
        itemSubType: 'regex_feature',
        actionType: 'add',
    },
    regex_feature_delete: {
        itemType: 'nlu',
        itemSubType: 'regex_feature',
        actionType: 'delete',
    },
    regex_feature_update: {
        itemType: 'nlu',
        itemSubType: 'regex_feature',
        actionType: 'update',
    },
    story_add: {
        itemType: 'dialogue',
        itemSubType: 'story',
        actionType: 'add',
    },
    story_delete: {
        itemType: 'dialogue',
        itemSubType: 'story',
        actionType: 'delete',
    },
    story_update: {
        itemType: 'dialogue',
        itemSubType: 'story',
        actionType: 'update',
    },
    story_group_add: {
        itemType: 'dialogue',
        itemSubType: 'story_group',
        actionType: 'add',
    },
    story_group_delete: {
        itemType: 'dialogue',
        itemSubType: 'story_group',
        actionType: 'delete',
    },
    story_group_update: {
        itemType: 'dialogue',
        itemSubType: 'story_group',
        actionType: 'update',
    },
};
