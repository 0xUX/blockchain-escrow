import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link, NavLink as RouterNavLink, withRouter } from 'react-router-dom';
import { Container, Navbar, NavbarBrand } from 'reactstrap';
//import { Collapse, NavbarToggler, Nav, NavItem, NavLink } from 'reactstrap';
import SelectCurrentUser from './select-current-user';
import Message from './message';
import { userExists } from '../redux/selectors';

class Layout extends Component {
    state = {
        collapsed: true
    }

    toggleNavBar = () => {
        this.setState({ collapsed: !this.state.collapsed });
    }
    
    render() {
        const { isUser } = this.props;
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
                </Navbar>
                <Container>
                    <SelectCurrentUser />
                    {!isUser && <Message color="warning" msg="You need to have an Ethereum account to use this dapp." />}
                    {isUser && this.props.children}
                </Container>
            </div>
        );
    }
}

Layout.propTypes = {
    isUser: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    const isUser = userExists(state);
    return { isUser };
};

export default withRouter(connect(
    mapStateToProps
)(Layout));
