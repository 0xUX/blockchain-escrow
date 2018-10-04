import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Container } from 'reactstrap';
import { Message } from './ui';
import { userExists } from '../redux/selectors';
import Balance from './balance';

class Body extends Component {

    componentDidMount() {
        const { onRequestFiat } = this.props;
        onRequestFiat('USD');
    }

    showMessages = () => {
        const { isUser, fiat, currency } = this.props;
        if(!isUser) return <Message color="warning" msg="You need to have an Ethereum account to use this dapp." />;
        if(fiat.error) return <Message color="danger" msg={`Unable to load the conversion rate for ETH to ${currency}.`} />;
        return null;
    }

    render() {
        const { isUser, currency, showBalance } = this.props;

        return (
            <Container className="pb-5">
                {showBalance && <Balance />}
                {this.showMessages()}
                {isUser && this.props.children}
            </Container>
        );
    }
}

Body.propTypes = {
    isUser: PropTypes.bool.isRequired,
    currency: PropTypes.string.isRequired,
    fiat: PropTypes.object.isRequired,
    showBalance: PropTypes.bool.isRequired,
    onRequestFiat: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const isUser = userExists(state);
    return { isUser, currency: state.currency, fiat: state.fiat, showBalance: state.showBalance };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: "FIAT_CALL_REQUEST", payload: {currency} })
    };
};

const BodyContainer = drizzleConnect(Body, mapStateToProps, mapDispatchToProps);

export default BodyContainer;
