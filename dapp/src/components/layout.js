import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { Container, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import SelectCurrentUser from './selectCurrentUser';

class Layout extends Component {
    state = {
        collapsed: true
    }

    toggleNavBar = () => {
        this.setState({ collapsed: !this.state.collapsed });
    }
    
    render() {
        return (
            <div>
                <Navbar color="light" light expand="md">
                    <NavbarBrand tag={Link} to={'/'}>Domain Escrow</NavbarBrand>                
                    <NavbarToggler onClick={this.toggleNavBar} />
                    <Collapse isOpen={!this.state.collapsed} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink exact to="/" tag={RouterNavLink}>Home</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink exact to="/agent" tag={RouterNavLink}>Agents</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
                <Container>
                    <SelectCurrentUser />
                    {this.props.children}
                </Container>
            </div>
        );
    }
}

Layout.propTypes = {

};

export default Layout;
