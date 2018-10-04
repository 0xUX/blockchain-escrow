import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import DomainNameForm from './domain-name-form';

// @@@@
//import UserAssets from './user-assets';
//import { AgentLink } from './static';
//import { userIsAgent } from '../redux/selectors';

class Home extends Component {
    render() {
        // @@@@
        //const { currentUser, isAgent } = this.props;


        const { web3status, web3contracts, web3accounts, web3accountBalances, web3transactions, web3transactionStack } = this.props;

//        console.log(this.props);

        return (
            <div>
                {/* @@@@@@@@@@@@@@@@ */}
                {/* isAgent && <AgentLink agentKey={currentUser} /> */}
                <DomainNameForm />
                {/* <UserAssets /> */}
            </div>
        );
    }
};

Home.propTypes = {

};

const mapStateToProps = state => {
    // @@@@
    //const isAgent = userIsAgent(state);
    return { //currentUser: state.currentUser, isAgent,
             web3status: state.web3,
             web3contracts: state.contracts,
             web3accounts: state.accounts,
             web3accountBalances: state.accountBalances,
             web3transactions: state.transactions,
             web3transactionStack: state.transactionStack
    };
};

export default drizzleConnect(Home, mapStateToProps);
