import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import Balance from './balance';
import DomainNameForm from './domain-name-form';
import UserAssets from './user-assets';

class Home extends Component {
    render() {
        const { currentUser } = this.props;
        return (
            <div>
                <h1>Home</h1>
                <Balance />
                <DomainNameForm />
                <UserAssets />
            </div>
        );
    }
};

Home.propTypes = {
    currentUser: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return { currentUser: state.currentUser };
};

export default connect(
    mapStateToProps
)(Home);
