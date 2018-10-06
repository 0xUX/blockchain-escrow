import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { Container } from 'reactstrap';
import { networkDetails } from '../lib/network';
import { Message } from './ui';
import { userExists } from '../redux/selectors';
import { FROM_BLOCK, ADDRESS } from '../constants';
import Balance from './balance';

let subscriptionNetwork = networkDetails('rinkeby');
let web3websocket; // web3 interface for subscription network (Infura)

class Body extends Component {
    constructor(props, context) {
        super(props);

        this.web3 = context.drizzle.web3;

        this.contracts = context.drizzle.contracts;
    }

    state = {
        pastLogsLoading: false // @@@ needed?
    }

    async componentDidMount() {
        // get fiat conversion rate
        const { onRequestFiat } = this.props;
        onRequestFiat('USD');

        // Get past logs, uses the metamask provider
        this.getPastLogs();
    }

    getPastLogs = async () => {
        const web3 = this.web3; // this uses the web3 provider passed in from drizzle context, so MM

        this.setState({ pastLogsLoading: true });

        this.setState({ coursesFromLogsLoading: false });

        // Returns array of transactions:
        // address:"0x091A02BF0C25B519b0B4E99cfAd72Aa3c07362B3"
        // blockHash:"0xc62914abe38b13c2a313534ce062cf5e5cce50db3a52eab510fe1882edcdd6b7"
        // blockNumber:2864371
        // data:"0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000007455448203130310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045374616e00000000000000000000000000000000000000000000000000000000"
        // id:"log_f112fdb8"
        // logIndex:6
        // removed:false
        // topics: [
        //           0:"0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8"
        //           1:"0xa089d35ebaa48c1120412580bc3d366c8652b094a8daba79723d50d438816b25"
        // ]
        // length:2
        // transactionHash:"0xfcde462033a033a78757233a5be2ca331dcf74a812c8825fdcb5f75f632ad1cb"
        // transactionIndex:7
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

Body.contextTypes = {
    drizzle: PropTypes.object
};

Body.propTypes = {
    isUser: PropTypes.bool.isRequired,
    currency: PropTypes.string.isRequired,
    fiat: PropTypes.object.isRequired,
    showBalance: PropTypes.bool.isRequired,
    onRequestFiat: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const isUser = userExists(state);
    return { isUser,
             currency: state.currency,
             fiat: state.fiat,
             showBalance: state.showBalance };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: "FIAT_CALL_REQUEST", payload: {currency} })
    };
};

const BodyContainer = drizzleConnect(Body, mapStateToProps, mapDispatchToProps);

export default BodyContainer;
