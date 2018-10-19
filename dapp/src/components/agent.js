import React, { Component } from "react";
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { Link, Redirect } from 'react-router-dom';
import { drizzleConnect } from 'drizzle-react';
import { AGENTS } from "../constants";
import UserAssets from './user-assets';
import DomainNameForm from './domain-name-form';
import { DelayedSpinner } from './ui';


export class Agent extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;
        this.whoamiKey = this.contracts.Escrow.methods.whois.cacheCall(props.account);
        this.whoisKeys = {};
        for (let agent of AGENTS) {
            this.whoisKeys[agent] = this.contracts.Escrow.methods.whois.cacheCall(agent);
        }
    }

    render() {
        const { Escrow } = this.props;
        if(!(this.whoamiKey in Escrow.whois)) return <DelayedSpinner />;
        const { enrolled } = Escrow.whois[this.whoamiKey].value;
        let agentInfoRdy = false;
        const fees = [];
        for (let agent of AGENTS) {
            if(this.whoisKeys[agent] in Escrow.whois) {
                fees[agent] = (Escrow.whois[this.whoisKeys[agent]].value.permillage/10).toFixed(2);
            }
        }
        return (
            <div>
                <h1>Agents</h1>
                {enrolled && <UserAssets agentView /> }
                {!enrolled &&
                 <div>
                     <p>Intro into agents: why make use of an escrow agent etc.</p>
                     <p>Want to become an agent? Drop us an email!</p>
                     <p>Our top recommended agents:</p>
                     <ul>
                         {Object.keys(this.whoisKeys).map(agent => (
                             <li key={agent}>
                                 <Link to={`/agent/${agent}`}>{agent}</Link> (Fee: {fees[agent]}%)
                             </li>
                         ))
                         }
                     </ul>
                 </div>
                }
            </div>
        );
    }
};

Agent.contextTypes = {
    drizzle: PropTypes.object
};

Agent.propTypes = {
    Escrow: PropTypes.object.isRequired,
    account: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return {
        Escrow: state.contracts.Escrow,
        account: state.accounts[0]
    };
};

Agent = drizzleConnect(Agent, mapStateToProps);


export class SellViaAgent extends Component {
    state = {
        whoisKey: null
    };

    componentDidMount() {
        const { match } = this.props;
        const { agentAccount } = match.params;
        const { Escrow } = this.context.drizzle.contracts;
        const whoisKey = Escrow.methods.whois.cacheCall(agentAccount);
        this.setState({ whoisKey });
    }

    render() {
        const { account, match, Escrow } = this.props;
        const { agentAccount } = match.params;

        // if current user is the agent go to custom agent page
        if(account === agentAccount) return <Redirect to="/agent" />;

        // check if agentAccount is indeed an agent
        const whois = Escrow.whois[this.state.whoisKey];
        if(!whois) return null;
        if(!whois.value.enrolled) return <Redirect to="/agent" />;

        return (
            <div>
                <h1>Agent {agentAccount}</h1>
                <DomainNameForm agentAccount={agentAccount} />
            </div>
        );
    }
}

SellViaAgent.contextTypes = {
    drizzle: PropTypes.object
};

SellViaAgent.propTypes = {
    account: PropTypes.string.isRequired,
    Escrow: PropTypes.object.isRequired
};

const mapStateToProps2 = state => {
    return {
        account: state.accounts[0],
        Escrow: state.contracts.Escrow
    };
};

SellViaAgent = drizzleConnect(SellViaAgent, mapStateToProps2);
