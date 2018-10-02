import React, { Component } from "react";
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import DomainNameForm from './domain-name-form';
import UserAssets from './user-assets';
import { AgentLink } from './static';
import { userIsAgent } from '../redux/selectors';

class Home extends Component {
    render() {
        const { currentUser, isAgent } = this.props;
        return (
            <div>
                {isAgent && <AgentLink agentKey={currentUser} />}
                <DomainNameForm />
                <UserAssets />
            </div>
        );
    }
};

Home.propTypes = {
    currentUser: PropTypes.string.isRequired,
    isAgent: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    const isAgent = userIsAgent(state);
    return { currentUser: state.currentUser, isAgent };
};

export default drizzleConnect(Home, mapStateToProps);
