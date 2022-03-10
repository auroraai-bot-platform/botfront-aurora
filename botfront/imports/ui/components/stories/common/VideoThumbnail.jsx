import React, {
    useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
    Image, Input, Button, Modal,
} from 'semantic-ui-react';

function getYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
        ? match[2]
        : null;
}

function getVideoThumbPic(url) {
    const youtubeId = getYoutubeId(url);
    if (youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    }
    return null;
}


function formatVideoUrl(url) {
    const youtubeId = getYoutubeId(url);
    if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}`;
    }
    return url;
}

export default function VideoThumbnail(props) {
    const {
        value, editable, onChange, otherActions, className,
    } = props;
    const [newValue, setNewValue] = useState(value);
    const [modalOpen, setModalOpen] = useState(false);
    useEffect(() => setNewValue(value), [value]);

    const videoUrlRef = useRef();

    const handleSrcChange = (src) => {
        onChange(src);
    };

    const setVideoFromUrlBox = () => {
        handleSrcChange(formatVideoUrl(videoUrlRef.current.inputRef.current.value));
        setModalOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setVideoFromUrlBox();
        }
    };


    const actions = [
        ['Set video', () => setModalOpen(true), 'set-video'],
        ...otherActions,
    ];

    const renderSetVideo = () => (
        <div className='video-modal'>
            <b>Insert video from URL</b>
            <br />
            <div className='side-by-side middle'>
                <Input
                    ref={videoUrlRef}
                    autoFocus
                    value={newValue}
                    onChange={(_, { value: v }) => setNewValue(v)}
                    placeholder='URL'
                    onKeyDown={handleKeyDown}
                    size='small'
                    data-cy='video-url-input'
                    className='video-url-input'
                />
                <Button primary onClick={setVideoFromUrlBox} size='small' content='Save' />
            </div>
        </div>
    );

    return (
        <div data-cy='video-container' className={`video-container ${value.trim() ? 'video-set' : ''} ${className}`}>
            {
                (
                    <>
                        <div className={`overlay-menu ${!editable ? 'uneditable' : ''}`}>
                            <div>
                                {editable && (
                                    <Button.Group vertical>
                                        {actions.map(([title, func, dataCy, buttonClass]) => (
                                            <Button basic key={title} onClick={func} content={title} data-cy={dataCy} className={buttonClass} />
                                        ))}
                                    </Button.Group>
                                )}
                            </div>
                        </div>
                        <Image src={getVideoThumbPic(value) || '/images/video-temp.svg'} size='small' alt=' ' />
                    </>
                )
            }
            {modalOpen && (
                <Modal
                    open
                    size='tiny'
                    onClose={setVideoFromUrlBox}
                    content={renderSetVideo()}
                />
            )}
        </div>
    );
}

VideoThumbnail.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
    editable: PropTypes.bool,
    otherActions: PropTypes.array,
    className: PropTypes.string,
};

VideoThumbnail.defaultProps = {
    onChange: () => {},
    otherActions: [],
    editable: true,
    value: '',
    className: '',
};
