import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Button, Form, FormGroup, Input } from 'reactstrap';
import { updateBalance } from '../redux/actions';
import { getUserBalance } from '../redux/selectors';

class Balance extends Component {
    state = {
        deposit: '',
        withdraw: ''
    }
    
    handleDeposit = (e) => {
        e.preventDefault();
        const { currentUser, balance, updateBalance } = this.props;
        const newBalance = balance + Number(this.state.deposit);
        updateBalance(currentUser, newBalance);
        this.setState({ deposit: '' });
    }

    handleWithdraw = (e) => {
        e.preventDefault();
        const { currentUser, balance, updateBalance } = this.props;
        const newBalance = Math.max(0, balance - Number(this.state.withdraw));
        updateBalance(currentUser, newBalance);
        this.setState({ withdraw: '' });
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });
    }
    
    render() {
        const { currentUser, balance } = this.props;
        return (
            <div className="card p-3 mt-1">
                <p>Current balance: {balance} Ether</p>
                <Form inline onSubmit={this.handleDeposit}>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                        <Input name="deposit"
                               placeholder="enter amount in Ether"
                               onChange={this.handleChange}
                               value={this.state.deposit}
                        />
                    </FormGroup>
                    <Button type="submit">deposit</Button>
                </Form>
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
    balance: PropTypes.number.isRequired,
    updateBalance: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const balance = getUserBalance(state);
    return { currentUser: state.currentUser, balance };
};

export default connect(
    mapStateToProps,
    { updateBalance }
)(Balance);
