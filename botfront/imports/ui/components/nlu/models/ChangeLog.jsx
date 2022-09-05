import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import 'react-table-v6/react-table.css';
import ReactTable from 'react-table-v6';
import moment from 'moment';
import DatePicker from '../../common/DatePicker';

const ChangeLog = (props) => {
    const { projectId } = props;

    const defaultPageSize = 10;

    const prettifyJson = (data) => {
        try {
            return JSON.stringify(JSON.parse(data), null, 2);
        } catch (error) {
            return data;
        }
    };

    const columns = [
        {
            Header: 'updatedAt',
            accessor: 'updatedAt',
            id: 'updatedAt',
            Filter: ({ filter, onChange }) => (
                <DatePicker
                    onConfirm={(newStart, newEnd) => {
                        const data = { start: newStart.toISOString(), end: newEnd.toISOString() };
                        onChange(JSON.stringify(data));
                    }}
                />
            ),
        },
        {
            Header: 'Item Name',
            accessor: 'itemName',
            id: 'itemName',
        },
        {
            Header: 'Item Id',
            accessor: 'itemId',
            id: 'itemId',
        },
        {
            Header: 'Item Type',
            accessor: 'itemType',
            id: 'itemType',
        },
        {
            Header: 'Item Sub Type',
            accessor: 'itemSubType',
            id: 'itemSubType',
        },
        {
            Header: 'Action Type',
            accessor: 'actionType',
            id: 'actionType',
        },
        {
            Header: 'User',
            accessor: 'user',
            id: 'user',
        },
    ];

    const subColumns = [
        {
            Header: 'Before',
            accessor: 'before',
            id: 'before',
            Cell: row => (
                <pre>
                    {prettifyJson(row.value)}
                </pre>
            ),
        },
        {
            Header: 'After',
            accessor: 'after',
            id: 'after',
            Cell: row => (
                <pre>
                    {prettifyJson(row.value)}
                </pre>
            ),
        },
    ];

    const [loading, setLoading] = React.useState(false);
    const [pageCount, setPageCount] = React.useState(0);

    const [changeData, setChangeData] = React.useState([]);
    const reactTable = React.useRef();

    const fetchData = (state) => {
        (async () => {
            setLoading(true);

            const [{ id, desc }] = state?.sorted?.length > 0 ? state.sorted : [{ id: 'updatedAt', desc: true }];
            const { data, meta } = await Meteor.callWithPromise('changes.find', projectId, state.page, state.pageSize, id, desc, state.filtered);

            setChangeData(data);

            const newPageCount = Math.ceil(meta.total / meta.pageSize);
            setPageCount(newPageCount);

            setLoading(false);
        })();
    };

    return (
        <div>
            <ReactTable
                style={{ height: 'calc(100vh - 200px)' }}
                ref={reactTable}
                manual
                onFetchData={fetchData}
                data={changeData}
                columns={columns}
                pages={pageCount}
                defaultPageSize={defaultPageSize}
                loading={loading}
                showPaginationTop
                filterable
                SubComponent={row => (
                    <div style={{ padding: '20px' }}>
                        <ReactTable
                            columns={subColumns}
                            data={[row?.original]}
                            defaultPageSize={1}
                            pages={0}
                            showPagination={false}
                            sortable={false}
                        />
                    </div>
                )}
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
