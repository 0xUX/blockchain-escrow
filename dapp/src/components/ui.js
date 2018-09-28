import React from "react";
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';

export const Message = props => {
    return (
        <Alert color={props.color}>
            {props.msg}
        </Alert>
    );
};

Message.propTypes = {
    msg: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
};
