import { Loader, Menu } from 'semantic-ui-react';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import LanguageDropdown from '../common/LanguageDropdown';
import SearchBar from './search/SearchBar';
import PageMenu from '../utils/PageMenu';
import { setWorkingDeploymentEnvironment } from '../../store/actions/actions';

const Stories = React.lazy(() => import('./Stories'));

const StoriesContainer = (props) => {
    const { params, setEnvironment } = props;

    // force env to development when user goes to "Dialogue" menu to make sure all responses should be development
    useEffect(() => {
        setEnvironment('development');
    }, []);

    return (
        <>
            <PageMenu title='Stories' icon='book' withTraining>
                <Menu.Item>
                    <LanguageDropdown />
                </Menu.Item>
                <Menu.Item className='stories-page-menu-searchbar'>
                    <SearchBar />
                </Menu.Item>
            </PageMenu>
            <React.Suspense fallback={<Loader />}>
                <Stories projectId={params.project_id} />
            </React.Suspense>
        </>
    );
};

StoriesContainer.propTypes = {
    params: PropTypes.object.isRequired,
    setEnvironment: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    // Map function you want to call (let's name it setEnvironment) to the action
    setEnvironment: setWorkingDeploymentEnvironment,
};

// Modify the export to connect to redux store:
export default connect(mapStateToProps, mapDispatchToProps)(StoriesContainer);
