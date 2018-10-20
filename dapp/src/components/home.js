import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { getWhoAmI } from '../redux/selectors';
import DomainNameForm from './domain-name-form';
import UserAssets from './user-assets';
import { AgentLink } from './static';
import { DelayedSpinner } from './ui';


class Home extends Component {
    render() {
        const { account, whoami } = this.props;


        if(!whoami) return <DelayedSpinner />;
        const { enrolled } = whoami.value;

        console.log('Home RENDER'); // @@@

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
    account: PropTypes.string.isRequired,
    whoami: PropTypes.object
};

const mapStateToProps = state => {
    const whoami = getWhoAmI(state);
    return {
        account: state.accounts[0],
        whoami
    };
};

export default drizzleConnect(Home, mapStateToProps);
