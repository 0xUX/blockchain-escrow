import React, { Component } from "react";
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { getUserAssets } from '../redux/selectors';

class UserAssets extends Component {
    render() {
        const { currentUser, userAssets } = this.props;
        if(currentUser == '' || _.isEmpty(userAssets) ) return null;
        return (
            <div className="card p-3 mt-1">
                <p>My domains:</p>
                <ul>
                    {Object.keys(userAssets).map(domain => {
                         const dnprops = userAssets[domain];
                         return (
                             <li key={domain}>{domain} - {dnprops.price} Ether - <Link to={`/domain/${domain}`}>manage</Link></li>
                         );
                    })}
                </ul>
            </div>
        );
    }
};

UserAssets.propTypes = {
    currentUser: PropTypes.string.isRequired,
    userAssets: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    const userAssets = getUserAssets(state);
    return { currentUser: state.currentUser, userAssets: userAssets };
};

export default connect(
    mapStateToProps
)(UserAssets);
