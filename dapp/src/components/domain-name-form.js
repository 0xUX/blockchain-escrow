import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { addAsset } from '../redux/actions';
import { AGENT_FEES, HANDLING_FEE } from '../constants';
import { userIsAgent } from '../redux/selectors';
import { PriceBreakdown } from './static';
import { getPriceBreakdownInWei } from '../lib/util';

import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8546"); // for now @@@@@@

class DomainNameForm extends Component {
    state = {
        domain: '',
        price: '',
        done: false
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { currentUser, assets, addAsset, agentKey } = this.props;
        const {netPrice, escrowfee, handlingfee } = getPriceBreakdownInWei(this.state.price, agentKey);
        const asset = {
            seller: currentUser,
            price: netPrice,
            escrowfee: escrowfee,
            handlingfee: handlingfee,
            agent: agentKey || null,
            buyer: null,
            blocknumber: null,
            state: 'FORSALE'
        };
        addAsset(this.state.domain, asset);
        this.setState({ domain: '', price: '', done: true });
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });
    }

    render() {
        const { currentUser, agentKey, isAgent } = this.props;
        if(agentKey && this.state.done) return <Redirect to="/" />;
        return (
            <div className="card p-3 mt-1">
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
                <PriceBreakdown price={this.state.price} agentKey={agentKey} />
                {!agentKey && !isAgent &&
                 <div className="mt-5"><Link to="/agent">Limit your risk, sell via an agent >></Link></div>
                }
            </div>
        );
    }
};

DomainNameForm.propTypes = {
    currentUser: PropTypes.string.isRequired,
    addAsset: PropTypes.func.isRequired,
    isAgent: PropTypes.bool.isRequired,
    agentKey: PropTypes.string
};

const mapStateToProps = state => {
    const isAgent = userIsAgent(state);
    return { currentUser: state.currentUser, isAgent };
};

export default connect(
    mapStateToProps,
    { addAsset }
)(DomainNameForm);
