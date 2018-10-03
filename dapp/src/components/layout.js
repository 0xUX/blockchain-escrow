import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link, NavLink as RouterNavLink, withRouter } from 'react-router-dom';
import { Container, Button, Navbar, NavbarBrand, NavItem, Nav } from 'reactstrap';
//import { Collapse, NavbarToggler, Nav, NavItem, NavLink } from 'reactstrap';
import SelectCurrentUser from './select-current-user';
import { Message } from './ui';
import { formatAmount } from '../lib/util';
import { userExists } from '../redux/selectors';
import Balance from './balance';
import { getUserBalance } from '../redux/selectors';
import { utils as web3utils } from 'web3';  // for now @@@@@@

export const BalanceIcon = props => (
    <Button outline size="sm" onClick={props.onClick}>
        {formatAmount('eth', Number(web3utils.fromWei(props.balance)))}
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

    componentDidMount() {
        const { onRequestFiat } = this.props;
        onRequestFiat('USD');
    }

    toggleBalance = () => {
        this.setState({ showBalance: !this.state.showBalance });
    }

    showMessages = () => {
        const { isUser, fiat, currency } = this.props;
        if(!isUser) return <Message color="warning" msg="You need to have an Ethereum account to use this dapp." />;
        if(fiat.error) return <Message color="danger" msg={`Unable to load the conversion rate for ETH to ${currency}.`} />;
    }

    render() {
        const { isUser, balance, currency } = this.props;
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
                    {this.showMessages()}
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
    isUser: PropTypes.bool.isRequired,
    onRequestFiat: PropTypes.func.isRequired,
    balance: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    fiat: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    const isUser = userExists(state);
    const balance = getUserBalance(state);
    return { isUser, balance, currency: state.currency, fiat: state.fiat };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: "FIAT_CALL_REQUEST", payload: {currency} })
    };
};

export default withRouter(connect(
    mapStateToProps, mapDispatchToProps
)(Layout));
