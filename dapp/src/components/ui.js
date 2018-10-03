import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatAmount } from '../lib/util';

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

export let AmountPlusFiat = ({ currency, amountInEther, fiat }) => {
    const amountInFiat = fiat.fetching ? <DelayedSpinner /> : formatAmount(currency, amountInEther * fiat.fiat);
    return (
        <span>{formatAmount('eth', amountInEther)} {' \u2245 '} {amountInFiat}</span>
    );
};

AmountPlusFiat.propTypes = {
    amountInEther: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    fiat: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return { currency: state.currency, fiat: state.fiat };
};

AmountPlusFiat = connect(
    mapStateToProps
)(AmountPlusFiat);


export const DelayedSpinner = ({ wait }) => {
    return <Delay wait={wait}><FontAwesomeIcon icon="circle-notch" spin /></Delay>;
};

DelayedSpinner.propTypes = {
    wait: PropTypes.number
};

DelayedSpinner.defaultProps = {
    wait: 250
};



export class Delay extends Component {
    state = {
        waiting: true,
    };

    componentDidMount() {
        this.timer = setTimeout(() => {
            this.setState({
                waiting: false
            });
        }, this.props.wait);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        if(this.state.waiting) return null;
        return this.props.children;
    }
}

Delay.propTypes = {
    wait: PropTypes.number
};

Delay.defaultProps = {
    wait: 250
};
