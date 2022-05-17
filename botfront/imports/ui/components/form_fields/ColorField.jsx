/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import connectField from 'uniforms/connectField';
import PropTypes from 'prop-types';
import { ChromePicker } from 'react-color';
import {
    Popup, Button,
} from 'semantic-ui-react';

function Color({
    value, onChange, label, id, required,
}) {
    const [isOpen, setIsOpen] = React.useState(false);

    const saveColor = (color) => {
        onChange(color);
        setIsOpen(!isOpen);
    };

    return (
        <div className={`${required ? 'required' : ''} field`}>
            <span>
                <Popup
                    trigger={(
                        <Button className='color-pick-button' style={{ background: value, color: value, padding: '8px 14px' }} onClick={(e) => { e.preventDefault(); }}>
                            Default
                        </Button>
                    )}
                    on='click'
                    open={isOpen}
                    onOpen={() => setIsOpen(!isOpen)}
                    onClose={() => setIsOpen(!isOpen)}
                    className='no-padding-popup'
                    content={(
                        <div>
                            <ChromePicker
                                disableAlpha
                                id={id}
                                color={value}
                                onChangeComplete={c => onChange(c.hex)}
                            />

                            <Button type='button' onClick={() => saveColor('')} style={{ marginTop: '10px', width: '100%' }}>Reset Color</Button>
                        </div>
                    )}
                />


            </span>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}


Color.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    required: PropTypes.bool,
};


Color.defaultProps = {
    required: false,
};

export default connectField(Color);
