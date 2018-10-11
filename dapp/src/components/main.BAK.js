import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components';
import { Container } from 'reactstrap';
import { Message } from './ui';
import { userExists } from '../redux/selectors';
import Balance from './balance';

import ABI from '../Escrow.abi.json'; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import EscrowContract from '../escrow';

class Body extends Component {
    constructor(props, context) {
        super(props);


        this.web3 = context.drizzle.web3;

        this.contracts = context.drizzle.contracts;

        // Get the contract ABI
        const abi = this.contracts['Escrow'].abi;

        // Fetch initial value from chain and return cache key for reactive updates.
        this.dataKey = this.contracts['Escrow'].methods['myBalance'].cacheCall();
     }

    componentDidMount() {
        const { onRequestFiat } = this.props;
        onRequestFiat('USD');
    }



    //  async componentDidMount() {

        // const escrow = EscrowContract(this.web3);
    // console.log('escrow', escrow);

        // if(escrow) {
        //     const code = await this.web3.eth.getCode(escrow.options.address);
        //     console.log(code);
        // }
    // }


    // state = {
    //     dataKey: null
    // }

    showMessages = () => {
        const { isUser, fiat, currency } = this.props;
        if(!isUser) return <Message color="warning" msg="You need to have an Ethereum account to use this dapp." />;
        if(fiat.error) return <Message color="danger" msg={`Unable to load the conversion rate for ETH to ${currency}.`} />;
        return null;
    }

    // componentDidMount() {
    //     const { contracts } = this.context.drizzle;
    //     const dataKey = contracts.Escrow.methods.myBalance.cacheCall();
    //     this.setState({ dataKey });
    // }


    render() {
        const { isUser, currency, showBalance } = this.props;
        const { web3 } = this.context.drizzle;

        //console.log(web3);






        // if(!(this.dataKey in this.props.web3contracts.Escrow.myBalance)) {
        //     return (
        //         <span>Loading...</span>
        //     );
        // }
        //
        // // If the data is here, get it and display it
        // const data = this.props.web3contracts.Escrow.myBalance[this.dataKey].value;


        return (
            <Container className="pb-5">

                {/*<div className="pure-u-1-1">
                    <h2>Active Account</h2>
                    <AccountData accountIndex="0" units="ether" precision="3" />

                    <br/><br/>


                    { data }

                </div>


                 <div className="pure-u-1-1">
                    <h2>Escrow</h2>
                    <p>This shows a simple ContractData component with no arguments, along with a form to set its value.</p>
                    <p><strong>handling_promillage</strong>: <ContractData contract="Escrow" method="handling_promillage" /></p>
                    <ContractForm contract="Escrow" method="fund" />

                    <br/><br/>
                    </div> */}


                {showBalance && <Balance />}
                {this.showMessages()}
                {isUser && this.props.children}
            </Container>
        );
    }
}

Body.contextTypes = {
    drizzle: PropTypes.object
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
    return { isUser, currency: state.currency, fiat: state.fiat, showBalance: state.showBalance,

             web3status: state.web3,
             web3contracts: state.contracts,
             web3accounts: state.accounts,
             web3accountBalances: state.accountBalances,
             web3transactions: state.transactions,
             web3transactionStack: state.transactionStack

    };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: "FIAT_CALL_REQUEST", payload: {currency} })
    };
};

export default drizzleConnect(Body, mapStateToProps, mapDispatchToProps);
