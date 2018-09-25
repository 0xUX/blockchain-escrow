import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { addAsset } from '../redux/actions';
import { AGENT_FEES, HANDLING_FEE } from '../constants';
import { userIsAgent } from '../redux/selectors';

class DomainNameForm extends Component {
    state = {
        domain: '',
        price: ''
    }
    
    handleSubmit = (e) => {
        e.preventDefault();
        const { currentUser, assets, addAsset, agentKey } = this.props;
        const asset = {
            seller: currentUser,
            price: Number(this.state.price),
            escrowfee: agentKey ? AGENT_FEES[agentKey] / 1000 * this.state.price : 0,
            handlingfee: HANDLING_FEE / 1000 * this.state.price,
            agent: agentKey || null,
            buyer: null,
            blocknumber: null,
            state: 'FORSALE'
        };
        addAsset(this.state.domain, asset);
        this.setState({ domain: '', price: '' });
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });
    }
    
    render() {
        const { currentUser, agentKey, isAgent } = this.props;
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
                    {!agentKey && !isAgent &&
                     <div className="mt-3"><Link to="/agent">Limit your risk, sell via an agent >></Link></div>
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
