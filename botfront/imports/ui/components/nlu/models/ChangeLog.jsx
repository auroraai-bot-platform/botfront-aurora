import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';

import ReactTable from 'react-table-v6';
import { Changes } from '../../../../api/changes/changes.collection';

const ChangeLog = (props) => {
    const columns = [
        { Header: 'projectId', accessor: 'projectId', id: 'projectId' },
        { Header: 'updatedAt', accessor: 'updatedAt', id: 'updatedAt' },
    ];

    const data = [
        { projectId: 1, updatedAt: 2 },
    ];

    const { changes } = props;
    const data2 = changes.map(({ projectId, updatedAt }) => {
        return { projectId, updatedAt };
    });
    console.log(data2);
    console.log(data);
    // const [changes, setChanges] = useState([]);

    return (
        <div>
            <h1>Hello World</h1>
            <ReactTable
                data={data2}
                columns={columns}
            />
        </div>
    );
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
