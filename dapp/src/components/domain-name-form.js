import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link, Redirect } from 'react-router-dom';
import { Button, ButtonGroup, Form, FormGroup, Input, Col } from 'reactstrap';
import { addAsset, setCurrency } from '../redux/actions';
import { AGENT_FEES, HANDLING_FEE } from '../constants';
import { userIsAgent } from '../redux/selectors';
import { ADD_ASSET, FIAT_CALL_REQUEST, SET_CURRENCY } from '../redux/actionTypes';
import { PriceBreakdown, PriceInput } from './static';
import { getPriceBreakdownInWei } from '../lib/util';


class DomainNameForm extends Component {
    state = {
        domain: '',
        price: '', // price in Ether (string)
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

    handlePriceChange = (e) => {
        const { fiat } = this.props;
        if(fiat.fiat !== null) {
            const name = e.target.name;
            const value = e.target.value;
            if(name === 'price') { // typing in ETH input
                this.setState({ price: value });
            } else if (name === 'fiat') { // typing in fiat input
                let ethValue = String((value / fiat.fiat).toFixed(18));
                if(Number(ethValue) === 0) ethValue = '';
                this.setState({ price: ethValue });
            }
        }
    }

    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });
    }

    render() {
        const { currentUser, agentKey, isAgent, fiat } = this.props;
        if(agentKey && this.state.done) return <Redirect to="/" />;
        return (
            <div className="card p-3 mt-1">
                <h3>Sell a domain name:</h3>
                <Form  onSubmit={this.handleSubmit}>
                    <FormGroup row>
                        <Col sm={12}>
                            <Input name="domain" id="domain"
                                   placeholder="enter domain name"
                                   onChange={this.handleChange}
                                   value={this.state.domain}
                            />
                            <small>Enter the FQDN, for example: yahoo.com</small>
                        </Col>
                    </FormGroup>
                    <PriceInput price={this.state.price} handlePriceChange={this.handlePriceChange} {...this.props} />
                    <Button type="submit" color="success">create offer</Button>
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
    agentKey: PropTypes.string,
    currency: PropTypes.string.isRequired,
    setCurrency: PropTypes.func.isRequired,
    onRequestFiat: PropTypes.func.isRequired,
    fiat: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    const isAgent = userIsAgent(state);
    return { currentUser: state.currentUser, isAgent, currency: state.currency, fiat: state.fiat };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: FIAT_CALL_REQUEST, payload: {currency} }),
        addAsset: (assetName, asset) => dispatch({ type: ADD_ASSET, payload: {assetName, asset} }),
        setCurrency: currency => dispatch({ type: SET_CURRENCY, payload: {currency} })
    };
};

export default connect(
    mapStateToProps, mapDispatchToProps
)(DomainNameForm);
