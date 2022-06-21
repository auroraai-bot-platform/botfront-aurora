import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';

// import 'react-table-v6/react-table.css';

import ReactTable from 'react-table-v6';
import { Changes } from '../../../../api/changes/changes.collection';

const ChangeLog = (props) => {
    const { projectId } = props;

    const defaultPageSize = 50;

    const columns = [
        {
            Header: 'updatedAt',
            accessor: 'updatedAt',
            id: 'updatedAt',
            Cell: props => props.value.toISOString(),
        },
        {
            Header: 'Item Type',
            accessor: 'category.item_type',
            id: 'itemType',
        },
        {
            Header: 'Item Sub Type',
            accessor: 'category.item_sub_type',
            id: 'itemSubType',
        },
        {
            Header: 'Action Type',
            accessor: 'category.action_type',
            id: 'actionType',
        },
        {
            Header: 'Item ID',
            accessor: 'item_id',
            id: 'itemId',
        },
        {
            Header: 'User',
            accessor: 'user',
            id: 'user',
        }
    ];

    const [loading, setLoading] = React.useState(false);
    const [pageCount, setPageCount] = React.useState(0);

    const [changeData, setChangeData] = React.useState([]);
    const reactTable = React.useRef();

    const fetchData = (state) => {
        (async () => {
            setLoading(true);

            const [{ id, desc }] = state?.sorted?.length > 0 ? state.sorted : [{ id: 'updatedAt', desc: true }];
            const { data, meta } = await Meteor.callWithPromise('changes.find', projectId, state.page, state.pageSize, id, desc);

            setChangeData(data);

            const newPageCount = Math.ceil(meta.total / meta.pageSize);
            setPageCount(newPageCount);

            setLoading(false);
        })();
    };

    return (
        <div>
            <h1>Hello World</h1>
            <ReactTable
                ref={reactTable}
                manual
                onFetchData={fetchData}
                data={changeData}
                columns={columns}
                pages={pageCount}
                defaultPageSize={defaultPageSize}
                loading={loading}
                showPaginationTop
            />
        </div>
    );
};


const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

// const withTrackerChangeLog = withTracker((props) => {
//     const { projectId } = props;
//     Meteor.subscribe('changes', projectId);
//     const changes = Changes.find().fetch();
//     console.log({ changes, projectId });
//     return { changes };
// })(ChangeLog);

export default connect(mapStateToProps)(ChangeLog);
