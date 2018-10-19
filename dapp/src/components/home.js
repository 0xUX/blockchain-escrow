import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import DomainNameForm from './domain-name-form';
import UserAssets from './user-assets';
import { AgentLink } from './static';
import { DelayedSpinner } from './ui';


class Home extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;
        this.whoamiKey = this.contracts.Escrow.methods.whois.cacheCall(props.account);
    }
    render() {
        const { Escrow, account } = this.props;
        if(!(this.whoamiKey in Escrow.whois)) return <DelayedSpinner />;
        const { enrolled } = Escrow.whois[this.whoamiKey].value;

        console.log('Home RENDER');

        return (
            <div>
                {enrolled && <AgentLink agentAccount={account} />}
                <DomainNameForm />
                <UserAssets />
            </div>
        );
    }
};

Home.contextTypes = {
    drizzle: PropTypes.object
};

Home.propTypes = {
    Escrow: PropTypes.object.isRequired,
    account: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return {
        Escrow: state.contracts.Escrow,
        account: state.accounts[0]
    };
};

export default drizzleConnect(Home, mapStateToProps);
