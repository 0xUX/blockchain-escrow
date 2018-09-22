import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'reactstrap';
import { connect } from "react-redux";
import { setCurrentUser } from "../redux/actions";
import { USERS } from "../constants";

class SelectCurrentUser extends Component {    
    render() {
        const { currentUser, setCurrentUser } = this.props;
        
        return (
            <div className="card m-4 shadow-sm">
                <div className="card-body">
                    <p>This dapp is not connected to any backend/blockchain. Use the buttons below to simulate the app behavior for a specific user. Reloading the app in the browser will clear all data.</p>
                    <ButtonGroup className="flex-wrap">
                        {Object.keys(USERS).map(userKey => {
                             const user = USERS[userKey];
                             return (
                                 <Button color="primary"
                                         onClick={() => setCurrentUser(user)}
                                         active={currentUser === user}
                                         key={user}
                                     >
                                     {user}
                                 </Button>
                             );
                        })}
                    </ButtonGroup>
                    <p className="mt-3">Current User: {currentUser}</p>
                </div>
            </div>
        );
    }
}

SelectCurrentUser.propTypes = {
    currentUser: PropTypes.string.isRequired,
    setCurrentUser: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return { currentUser: state.currentUser };
};

export default connect(
    mapStateToProps,
    { setCurrentUser }
)(SelectCurrentUser);
