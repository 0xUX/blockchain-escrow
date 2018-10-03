import React, { Component } from "react";
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { getUserAssets, getAgentAssets } from '../redux/selectors';
import { AssetInfo } from './static';
import { ASSET_STATES } from '../constants';

class UserAssets extends Component {
    render() {
        const { agentView, currentUser, userAssets, agentAssets } = this.props;
        const assets = agentView ? agentAssets : userAssets;
        const title = agentView ? 'Domains we provide our escrow service for': 'My domains';
        if(_.isEmpty(assets)) return null;
        return (
            <div className="card p-3 mt-1">
                <p>{title}:</p>
                <ul>
                    {Object.keys(assets).map(domain => {
                         const asset = assets[domain];
                         return (
                             <li key={domain}>
                                 {domain} <Link to={`/domain/${domain}`}>[ manage ]</Link>
                                 <AssetInfo asset={asset} />
                             </li>
                         );
                    })}
                </ul>
            </div>
        );
    }
};

UserAssets.propTypes = {
    currentUser: PropTypes.string.isRequired,
    userAssets: PropTypes.object.isRequired,
    agentAssets: PropTypes.object.isRequired,
    agentView: PropTypes.bool.isRequired
};

UserAssets.defaultProps = {
    agentView: false
}

const mapStateToProps = state => {
    const userAssets = getUserAssets(state);
    const agentAssets = getAgentAssets(state);
    return { currentUser: state.currentUser, userAssets, agentAssets };
};

export default connect(
    mapStateToProps
)(UserAssets);
