import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { USERS } from "../constants";
import Balance from './balance';
import DomainNameForm from './domain-name-form';

export class Agent extends Component {
    render() {
        const { currentUser } = this.props;
        const isAgent = currentUser.indexOf('AGENT') === 0;
        return (
            <div>
                <h1>Agents</h1>
                {isAgent && <Balance /> }
                {!isAgent &&
                 <div>
                     <p>Intro into agents blah blah</p>
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
    currentUser: PropTypes.string.isRequired
};

export class SellViaAgent extends Component {
    render() {
        const { currentUser, match } = this.props;
        const { agentKey } = match.params;
        return (
            <div>
                <h1>{USERS[agentKey]}</h1>
                <DomainNameForm agent={agentKey} />
            </div>            
        );
    }    
}

SellViaAgent.propTypes = {
    currentUser: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return { currentUser: state.currentUser };
};

Agent = connect(
    mapStateToProps
)(Agent);

SellViaAgent = connect(
    mapStateToProps
)(SellViaAgent);

