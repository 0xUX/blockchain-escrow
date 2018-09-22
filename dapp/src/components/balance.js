import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { updateBalance } from '../redux/actions';

class Balance extends Component {
    state = {
        deposit: '',
        withdraw: ''
    }
    
    handleDeposit = (e) => {
        e.preventDefault();
        const { currentUser, balances, updateBalance } = this.props;
        const balance = balances[currentUser] || 0;
        const newBalance = balance + Number(this.state.deposit);
        updateBalance(currentUser, newBalance);
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });
    }
    
    render() {
        const { currentUser, balances } = this.props;
        const balance = balances[currentUser] || 0;
        console.log(balances);        
        return (
            <div className="card p-3">
                <p>Current balance: {balance} Ether</p>
                <Form inline onSubmit={this.handleDeposit}>
                    <FormGroup>
                        <Input name="deposit"
                               placeholder="enter amount in Ether"
                               onChange={this.handleChange}
                               value={this.state.deposit}
                        />
                    </FormGroup>
                    <Button type="submit">deposit</Button>
                </Form>
                {balance > 0 &&
                 <Form inline onSubmit={console.log('withdraw')}>
                     <FormGroup>
                         <Input name="withdraw" id="withdraw" placeholder="enter amount in Ether" />
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
    balances: PropTypes.object.isRequired,
    updateBalance: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return { currentUser: state.currentUser, balances: state.balances };
};

export default connect(
    mapStateToProps,
    { updateBalance }
)(Balance);
