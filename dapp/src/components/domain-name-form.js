import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Col } from 'reactstrap';
import { addAsset, setCurrency } from '../redux/actions';
import { AGENT_FEES, HANDLING_FEE, INPUT_ETHER_DECIMALS } from '../constants';
import { userIsAgent } from '../redux/selectors';
import { ADD_ASSET, FIAT_CALL_REQUEST, SET_CURRENCY, UPDATE_DOMAIN } from '../redux/actionTypes';
import { PriceBreakdown, PriceInput, DomainInput } from './static';
import { getPriceBreakdownInWei } from '../lib/util';


class DomainNameForm extends Component {
    state = {
        price: '', // price in Ether (string)
        fiatInput: '',
        activeInput: null, // either eth or fiat, field we're typing in
        done: false,
        mode: null // either sell or buy
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { currentUser, assets, addAsset, agentKey, domain, updateDomain } = this.props;
        if(!this.state.price) return;
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
        addAsset(domain, asset);
        updateDomain('');
        this.setState({ price: '', fiatInput: '', done: true });
    }

    handlePriceChange = (e) => {
        const { fiat } = this.props;
        const precision = 10 ** INPUT_ETHER_DECIMALS;
        const name = e.target.name;
        const value = e.target.value;
        if(name === 'price') { // typing in ETH input
            if(value && !/^[0-9]{1,7}\.?[0-9]{0,18}$/.test(value)) return;
            const fiatValue = String(Math.round(value * fiat.fiat * 100) / 100);
            this.setState({ activeInput: 'eth', price: value, fiatInput: fiatValue });
        } else if (name === 'fiat') { // typing in fiat input
            if(fiat.fiat !== null) {
                if(value && !/^[0-9]{1,10}\.?[0-9]{0,2}$/.test(value)) return;
                const ethValue = String(Math.round(value / fiat.fiat * precision) / precision);
                this.setState({ activeInput: 'fiat', price: ethValue, fiatInput: value });
            }
        }
    }

    isFQDN = () => {
        // VERY loose check
        const { domain } = this.props;
        return /.+\..{2,}$/.test(domain);
    }

    render() {
        const { currentUser, agentKey, isAgent, fiat, currency, domain, updateDomain } = this.props;
        const { mode, done } = this.state;
        if(agentKey && done) return <Redirect to="/" />;
        if(mode === 'buy') return <Redirect to={`/domain/${domain}`} />;
        return (
            <div className="card p-3 mt-1">
                {(agentKey || mode === 'sell') && <h3>Sell a domain name:</h3>}
            <Form  onSubmit={this.handleSubmit}>
            <DomainInput />
            {!mode && !agentKey &&
             <FormGroup row>
                 <Col sm={6} className="mt-3">
                     <Button color="success" size="lg" onClick={() => this.setState({ mode: 'buy' }) } block disabled={!this.isFQDN()} >buy</Button>
                 </Col>
                 <Col sm={6} className="mt-3">
                     <Button color="success" size="lg" onClick={() => this.setState({ mode: 'sell' }) } block disabled={!this.isFQDN()} >sell</Button>
                 </Col>
             </FormGroup>
            }
            {(agentKey || mode === 'sell') &&
                 <div>
                     <PriceInput price={this.state.price}
                                 fiatInput={this.state.fiatInput}
                                 activeInput={this.state.activeInput}
                                 handlePriceChange={this.handlePriceChange} />
                     <Button type="submit" color="success">create offer</Button>
                     <PriceBreakdown price={this.state.price} agentKey={agentKey} />
                 </div>
                }
            </Form>
            {mode === 'sell' && !agentKey && !isAgent &&
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
    fiat: PropTypes.object.isRequired,
    domain: PropTypes.string.isRequired,
    updateDomain: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const isAgent = userIsAgent(state);
    return { currentUser: state.currentUser, isAgent, currency: state.currency, fiat: state.fiat, domain: state.domain };
};

const mapDispatchToProps = dispatch => {
    return {
        onRequestFiat: currency => dispatch({ type: FIAT_CALL_REQUEST, payload: {currency} }),
        addAsset: (assetName, asset) => dispatch({ type: ADD_ASSET, payload: {assetName, asset} }),
        setCurrency: currency => dispatch({ type: SET_CURRENCY, payload: {currency} }),
        updateDomain: domain => dispatch({ type: UPDATE_DOMAIN, payload: {domain} }),
    };
};

export default connect(
    mapStateToProps, mapDispatchToProps
)(DomainNameForm);
