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
        this.agentKeys = {};
        for (let agent of AGENTS) {
            this.agentKeys[agent] = this.contracts.Escrow.methods.whois.cacheCall(agent);
        }
    }

    render() {
        const { Escrow } = this.props;
        if(!(this.whoamiKey in Escrow.whois)) return <DelayedSpinner />;
        const { enrolled } = Escrow.whois[this.whoamiKey].value;
        let agentInfoRdy = false;
        const fees = [];
        for (let agent of AGENTS) {
            if(this.agentKeys[agent] in Escrow.whois) {
                fees[agent] = (Escrow.whois[this.agentKeys[agent]].value.permillage/10).toFixed(2);
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
                         {Object.keys(this.agentKeys).map(agent => (
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
    render() {
        const { account, match } = this.props;
        const { agentKey } = match.params;
        if(account === agentKey) return <Redirect to="/agent" />;
        return (
            <div>
              <h1>Agent {agentKey}</h1>
              <DomainNameForm agentKey={agentKey} />
            </div>
        );
    }
}

SellViaAgent.propTypes = {
    account: PropTypes.string.isRequired
};

const mapStateToProps2 = state => {
    return { account: state.accounts[0] };
};

SellViaAgent = drizzleConnect(SellViaAgent, mapStateToProps2);
