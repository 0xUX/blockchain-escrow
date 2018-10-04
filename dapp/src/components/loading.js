import React, { PureComponent, Children } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { NETWORK_ID } from '../constants';
import { Message, DelayedSpinner } from './ui';
import { Container } from 'reactstrap';

const Loading = props => {

    const { initialized, account, web3state, networkId, mini } = props;

    // All good, load the children
    if(initialized && account && networkId == NETWORK_ID) return Children.only(props.children);

    // Mini and not ready, return empty element
    if(mini) return null;

    // Loading till drizzle is initialized
    if(!initialized) return <Container className="m-5 text-center"><DelayedSpinner /></Container>;

    let msg = 'Unknown error, please try to reload your this page';

    // No network, meaning no MetaMask or fallback
    if (!networkId) msg = 'This browser has no connection to the Ethereum network. Please use the Chrome/FireFox extension MetaMask, or dedicated Ethereum browsers Mist or Parity.';

    // We have a network, but not the correct one
    else if(networkId && networkId != NETWORK_ID) msg = 'This app works on the Rinkeby network, make sure to switch to that network in MetaMask or your web3 browser';

    // We have the correct network, but user is not logged in
    else if(!account) msg = 'Please log in into your MetaMask or other wallet.';

    return (
        <Container className="pt-5">
            <div><Message msg={msg} color="warning" /></div>
        </Container>
    );
};

Loading.propTypes = {
    initialized: PropTypes.bool.isRequired,
    account: PropTypes.string,
    mini: PropTypes.bool
};

const mapStateToProps = state => {
    return {
        initialized: state.drizzleStatus.initialized,
        account: state.accounts[0],
        networkId: state.web3.networkId,
        web3state: state.web3.status
    };
};

const LoadingContainer = drizzleConnect(Loading, mapStateToProps);

export default LoadingContainer;
