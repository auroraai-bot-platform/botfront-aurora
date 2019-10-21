import React from 'react';
import PropTypes from 'prop-types';
import SlotPopupContent from './common/SlotPopupContent';

export const slotValueToLabel = value => (
    value === null
        ? 'null'
        : Array.isArray(value) && !value.length
            ? 'empty'
            : value.toString()
);

export default function SlotLabel({ value, onChange, size }) {
    const { type, name, slotValue } = value;
    return (
        <SlotPopupContent
            trigger={(
                <div className='label-container slot'>
                    <div className={`${size}-label-text label-context slot`}>
                        {type}
                    </div>
                    <div className={`${size}-label-value label-context slot`}>
                        {name}:&nbsp; <span className='slot-content'>{slotValueToLabel(slotValue)}</span>
                    </div>
                </div>
            )}
            onSelect={slot => onChange(slot)}
            value={value}
        />
    );
}

SlotLabel.propTypes = {
    value: PropTypes.object.isRequired,
    size: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

SlotLabel.defaultProps = {
    size: 'mini',
};