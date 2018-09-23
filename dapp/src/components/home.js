import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import Balance from './balance';
import DomainNameForm from './domain-name-form';

class Home extends Component {
    render() {
        const { currentUser } = this.props;
        return (
            <div>
                <h1>Home</h1>
                <Balance />
                <DomainNameForm />
              My domains: <Link to="/domain/dmo.com">dmo.com</Link>
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
