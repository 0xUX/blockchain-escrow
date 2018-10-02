import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'reactstrap';
import { drizzleConnect } from 'drizzle-react';
import { withRouter } from 'react-router-dom';
import { setCurrentUser } from "../redux/actions";
import { getRole } from '../redux/selectors';
import { USERS } from "../constants";

class SelectCurrentUser extends Component {
    render() {
        const { currentUser, setCurrentUser, role } = this.props;
        return (
            <div className="card m-4 shadow-sm">
                <div className="card-body">
                    <p>This dapp is not connected to any backend/blockchain. Use the buttons below to simulate the app behavior for a specific user. Reloading the app in the browser will clear all data.</p>
                    <ButtonGroup className="flex-wrap">
                        {Object.keys(USERS).map(userKey => {
                             const user = USERS[userKey];
                             return (
                                 <Button color="primary"
                                         onClick={() => setCurrentUser(userKey)}
                                         active={currentUser === userKey}
                                         key={userKey}
                                     >
                                     {user}
                                 </Button>
                             );
                        })}
                    </ButtonGroup>
                    <p className="mt-3">Current User (role): {USERS[currentUser] || 'n/a'} ({role || 'n/a'}).</p>
                </div>
            </div>
        );
    }
}

SelectCurrentUser.propTypes = {
    currentUser: PropTypes.string.isRequired,
    setCurrentUser: PropTypes.func.isRequired,
    role: PropTypes.string
};

const mapStateToProps = (state, props) => {
    const domain = props.location.pathname.replace('/domain/', '');
    const role = getRole(state, domain);
    return { currentUser: state.currentUser, role };
};

export default withRouter(drizzleConnect(SelectCurrentUser, mapStateToProps, { setCurrentUser }));
