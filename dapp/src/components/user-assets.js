import React, { Component } from "react";
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { drizzleConnect } from 'drizzle-react';
import { Link } from 'react-router-dom';
import { getUserAssets } from '../redux/selectors';
import { AssetInfo } from './asset-info';
import { ASSET_STATES } from '../constants';

class UserAssets extends Component {
    constructor(props, context) {
        super(props);
        this.contracts = context.drizzle.contracts;
    }

    render() {

        console.log('UserAssets RENDER');

        const { agentView, userAssets, Escrow, account } = this.props;

        let assets = [];
        _.forEach(userAssets, (dataKey, domain) => {
            const details = Escrow.details[dataKey].value;
            // depending on agentView add relevant events
            if(((details.seller === account || details.buyer === account) && !agentView) ||
               (details.agent === account && agentView)) {
                assets.push(
                    <li key={domain}>
                      {domain} <Link to={`/domain/${domain}`}>[ manage ]</Link>
                      <AssetInfo asset={details} />
                    </li>
                );
            }
        });

        const title = agentView ? 'Domains we provide our escrow service for': 'My domains';
        if(_.isEmpty(assets)) return null;
        return (
            <div className="card p-3 mt-1">
                <p>{title}:</p>
                <ul>
                    {assets}
                </ul>
            </div>
        );
    }
};

UserAssets.contextTypes = {
    drizzle: PropTypes.object
};

UserAssets.propTypes = {
    userAssets: PropTypes.object.isRequired,
    agentView: PropTypes.bool.isRequired,
    Escrow: PropTypes.object.isRequired,
    account: PropTypes.string.isRequired
};

UserAssets.defaultProps = {
    agentView: false
}

const mapStateToProps = state => {
    const userAssets = getUserAssets(state);
    return { userAssets,
             Escrow: state.contracts.Escrow,
             account: state.accounts[0]
           };
};

export default drizzleConnect(UserAssets, mapStateToProps);
