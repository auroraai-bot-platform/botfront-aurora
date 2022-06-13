import React, {
    useContext, useMemo, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Statistic, Button } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { saveAs } from 'file-saver';
import { Stories as StoriesCollection } from '../../../../api/story/stories.collection';
import { Loading } from '../../utils/Utils';
import IntentLabel from '../common/IntentLabel';
import DataTable from '../../common/DataTable';
import { ProjectContext } from '../../../layouts/context';
import { GET_INTENT_STATISTICS, GET_EXAMPLE_COUNT, GET_ENTITY_STATISTICS } from './graphql';
import { Changes } from '../../../../api/changes/changes.collection';

const ChangeLog = (props) => {
    const { changes, projectId } = props;
    // const [changes, setChanges] = useState([]);

    return <h1>Hello World {JSON.stringify(changes)}</h1>;
};


const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const withTrackerChangeLog = withTracker((props) => {
    const { projectId } = props;
    Meteor.subscribe('changes', projectId);
    const changes = Changes.find().fetch();
    console.log({ changes, projectId });
    return { changes };
})(ChangeLog);

export default connect(mapStateToProps)(withTrackerChangeLog);
