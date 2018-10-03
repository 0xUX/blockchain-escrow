import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { connect } from "react-redux";
import { USERS } from "../constants";
import UserAssets from './user-assets';
import DomainNameForm from './domain-name-form';
import { userIsAgent } from '../redux/selectors';

export class Agent extends Component {
    render() {
        const { currentUser, isAgent } = this.props;
        return (
            <div>
                <h1>Agents</h1>
                {isAgent && <UserAssets agentView /> }
                {!isAgent &&
                 <div>
                     <p>Intro into agents: why make use of an escrow agent etc.</p>
                     <p>Want to become an agent? Drop us an email!</p>
                     <p>Our top recommended agents:</p>
                     <ul>
                         {Object.keys(USERS).map(userKey => {
                              const user = USERS[userKey];
                              if(userKey.indexOf('AGENT') === 0) {
                                  return (
                                      <li key={user}><Link to={`/agent/${userKey}`}>{user}</Link></li>
                                  );
                              }
                         })}
                     </ul>
                 </div>
                }
            </div>
        );
    }
};

Agent.propTypes = {
    currentUser: PropTypes.string.isRequired,
    isAgent: PropTypes.bool.isRequired
};

export class SellViaAgent extends Component {
    render() {
        const { currentUser, match } = this.props;
        const { agentKey } = match.params;
        if(currentUser === agentKey) return <Redirect to="/agent" />;
        return (
            <div>
                <h1>{USERS[agentKey]}</h1>
                <DomainNameForm agentKey={agentKey} />
            </div>
        );
    }
}

SellViaAgent.propTypes = {
    currentUser: PropTypes.string.isRequired,
    isAgent: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    const isAgent = userIsAgent(state);
    return { currentUser: state.currentUser, isAgent };
};

Agent = connect(
    mapStateToProps
)(Agent);

SellViaAgent = connect(
    mapStateToProps
)(SellViaAgent);
