import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link, NavLink as RouterNavLink, withRouter } from 'react-router-dom';
import { Container, Button, Navbar, NavbarBrand, NavItem, Nav } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { Collapse, NavbarToggler, Nav, NavItem, NavLink } from 'reactstrap';
import SelectCurrentUser from './select-current-user';
import Message from './message';
import { userExists } from '../redux/selectors';
import Balance from './balance';
import { getUserBalance } from '../redux/selectors';

export const BalanceIcon = props => (
    <Button outline size="sm" onClick={props.onClick}>
        {props.balance} <FontAwesomeIcon icon={['fab', 'ethereum']} />
    </Button>
)

class Layout extends Component {
    state = {
        showBalance: false
        //collapsed: true
    }

    // toggleNavBar = () => {
    //     this.setState({ collapsed: !this.state.collapsed });
    // }

    toggleBalance = () => {
        this.setState({ showBalance: !this.state.showBalance });
    }

    render() {
        const { isUser, balance } = this.props;
        const { showBalance } = this.state;
        return (
            <div>
                <Navbar color="light" light expand="md">
                    <NavbarBrand tag={Link} to={'/'}>Domain Escrow</NavbarBrand>
                    {/*<NavbarToggler onClick={this.toggleNavBar} />
                        <Collapse isOpen={!this.state.collapsed} navbar>
                        <Nav className="ml-auto" navbar>
                        <NavItem>
                        <NavLink exact to="/" tag={RouterNavLink}>Home</NavLink>
                        </NavItem>
                        <NavItem>
                        <NavLink exact to="/agent" tag={RouterNavLink}>Agents</NavLink>
                        </NavItem>
                        </Nav>
                        </Collapse>*/}
                    { isUser &&
                      <Nav className="ml-auto" navbar>
                          <BalanceIcon balance={balance} onClick={this.toggleBalance} />
                      </Nav>
                    }
                </Navbar>
                <Container className="pb-5">
                    <SelectCurrentUser />
                    {!isUser && <Message color="warning" msg="You need to have an Ethereum account to use this dapp." />}
                    {showBalance && <Balance />}
                    {isUser && this.props.children}
                </Container>
                <div className="footer text-muted">
                    <Container>
                        <span className="small">{'\u00a9 ' + (new Date()).getFullYear()} <a href="http://0xUX.com" target="_blank">0xUX</a></span>
                    </Container>
                </div>
            </div>
        );
    }
}

Layout.propTypes = {
    isUser: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    const isUser = userExists(state);
    const balance = getUserBalance(state);
    return { isUser, balance };
};

export default withRouter(connect(
    mapStateToProps
)(Layout));
