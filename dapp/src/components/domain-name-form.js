import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { updateAsset } from '../redux/actions';
import { AGENT_FEES, HANDLING_FEE } from '../constants';

class DomainNameForm extends Component {
    state = {
        domain: '',
        price: ''
    }
    
    handleSubmit = (e) => {
        e.preventDefault();
        const { currentUser, assets, updateAsset, agent } = this.props;
        const asset = {
            seller: currentUser,
            price: Number(this.state.price),
            escrowfee: agent ? AGENT_FEES[agent] / 1000 * this.state.price : null,
            handlingfee: HANDLING_FEE / 1000 * this.state.price,
            agent: agent || null,
            buyer: null,
            blocknumber: null,
            state: 'FORSALE'
        };
        updateAsset(this.state.domain, asset);
        this.setState({ domain: '', price: '' });
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });
    }
    
    render() {
        const { currentUser } = this.props;
        if(currentUser == '') return null;
        return (
            <div className="card p-3">
                <p>Sell domain:</p>
                <Form inline  onSubmit={this.handleSubmit}>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                        <Input name="domain"
                               placeholder="enter domain name"
                               onChange={this.handleChange}
                               value={this.state.domain}
                        />
                    </FormGroup>
                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                        <Input name="price"
                               placeholder="enter price in Ether"
                               onChange={this.handleChange}
                               value={this.state.price}
                        />
                    </FormGroup>
                    <Button type="submit">create offer</Button>
                </Form>
            </div>
        );
    }
};

DomainNameForm.propTypes = {
    currentUser: PropTypes.string.isRequired,
    updateAsset: PropTypes.func.isRequired,
    agent: PropTypes.string
};

const mapStateToProps = state => {
    return { currentUser: state.currentUser };
};

export default connect(
    mapStateToProps,
    { updateAsset }
)(DomainNameForm);
