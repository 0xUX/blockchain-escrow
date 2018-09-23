import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import Balance from './balance';

class Domain extends Component {
    render() {
        const { currentUser, match } = this.props;
        const { domain } = match.params;
        return (
            <div>
                <h1>Domain: {domain}</h1>
                <Balance />
            </div>
        );
    }
};

Domain.propTypes = {
    currentUser: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return { currentUser: state.currentUser };
};

export default connect(
    mapStateToProps
)(Domain);
