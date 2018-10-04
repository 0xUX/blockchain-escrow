import React, { Component, Children } from "react";
import PropTypes from 'prop-types';
import Loading from './loading';
import { Link } from 'react-router-dom';
//import { NavLink as RouterNavLink } from 'react-router-dom';
import { Container, Navbar, NavbarBrand, Nav } from 'reactstrap';
//import { Collapse, NavbarToggler, Nav, NavItem, NavLink } from 'reactstrap';
import BalanceIcon from './balance-icon';

class Layout extends Component {
    state = {
        //collapsed: true
    }

    // toggleNavBar = () => {
    //     this.setState({ collapsed: !this.state.collapsed });
    // }

    render() {
        const { children } = this.props;

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
                      <Nav className="ml-auto" navbar>
                          <Loading mini><BalanceIcon /></Loading>
                      </Nav>
                </Navbar>
                <Loading>
                    {Children.only(children)}
                </Loading>
                <div className="footer text-muted">
                    <Container>
                        <span className="small">{'\u00a9 ' + (new Date()).getFullYear()} <a href="http://0xUX.com" target="_blank">0xUX</a></span>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Layout;
