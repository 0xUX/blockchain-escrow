import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateBalance } from '../redux/actions';
import { getUserBalance } from '../redux/selectors';
import { formatAmount } from '../lib/util';
import { utils as web3utils } from 'web3';  // for now @@@@@@

class Balance extends Component {
    state = {
        //deposit: '',
        withdraw: ''
    }

    // handleDeposit = (e) => {
    //     e.preventDefault();
    //     const { currentUser, balance, updateBalance } = this.props;
    //     const newBalance = web3utils.fromWei(balance) + Number(this.state.deposit);
    //     updateBalance(currentUser, web3utils.toWei(String(newBalance)));
    //     this.setState({ deposit: '' });
    // }

    handleWithdraw = (e) => {
        e.preventDefault();
        const { currentUser, balance, updateBalance } = this.props;

        let newBalance = Math.max(0, web3utils.fromWei(balance) - Number(this.state.withdraw));
        updateBalance(currentUser, web3utils.toWei(String(newBalance)));
        this.setState({ withdraw: '' });
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });
    }

    render() {
        const { currentUser, balance, fiat, currency } = this.props;
        const balanceInEther = web3utils.fromWei(balance);
        const balanceInFiat = fiat.fetching ? <FontAwesomeIcon icon="circle-notch" spin /> : formatAmount(currency, balanceInEther * fiat.fiat);
        console.log(fiat);
        return (
            <div className="card p-3 mt-1">
                <p>Current balance: {formatAmount('eth', balanceInEther)} (Ether) {' \u2245 '} {balanceInFiat}</p>
                {/*<Form inline onSubmit={this.handleDeposit}>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Input name="deposit"
                    placeholder="enter amount in Ether"
                    onChange={this.handleChange}
                    value={this.state.deposit}
                    />
                    </FormGroup>
                    <Button type="submit">deposit</Button>
                    </Form>*/}
                {balance > 0 &&
                 <Form className="mt-1" inline onSubmit={this.handleWithdraw}>
                     <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                         <Input name="withdraw"
                                placeholder="enter amount in Ether"
                                onChange={this.handleChange}
                                value={this.state.withdraw}
                         />
                     </FormGroup>
                     <Button type="submit">withdraw</Button>
                 </Form>
                }
            </div>
        );
    }
};

Balance.propTypes = {
    currentUser: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    updateBalance: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired,
    currency: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    const balance = getUserBalance(state);
    return { currentUser: state.currentUser, balance, fiat: state.fiat, currency: state.currency };
};

export default connect(
    mapStateToProps,
    { updateBalance }
)(Balance);
