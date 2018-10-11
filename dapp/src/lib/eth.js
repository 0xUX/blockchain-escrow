import _ from 'lodash-es';

export const getEventAbiInputs = (abi, event, stripIndexed=true) => {
    abi = JSON.parse(abi);
    for(let o of abi) {
        if(o.type == 'event' && o.name == event) {
            return _.remove(o.inputs, function(i) {
                return stripIndexed && !i.indexed;
            });
        }
    }
    return {};
};


export const getEventAbi = (abi, event) => {
    abi = JSON.parse(abi);
    for(let o of abi) {
        if(o.type == 'event' && o.name == event) {
            return o;
        }
    }
    return {};
};


export const getTopic0s = (web3, ABI) => {
    const eventTypes = ['Offered', 'Retracted', 'Bought', 'FundsReleased'];
    const topic0toEvent = {};
    eventTypes.forEach(et => {
        console.log(et);
        let eventABI = getEventAbi(ABI, et);
        console.log(eventABI, typeof eventABI);
        let topic0 = web3.eth.abi.encodeEventSignature(eventABI);
        topic0toEvent[topic0] = [et, eventABI];
    });
    return topic0toEvent;
};


export const getGasEstimate = async (web3, account, method, ...params) => {
    const gasPrice = await web3.eth.getGasPrice();
    const estimateGas = await method.apply(this, params).estimateGas({
        from: account
    });

    const costEstimate = gasPrice * estimateGas;
    const proposedGasLimit = Math.round(estimateGas * 1.2);

    return [gasPrice, estimateGas, costEstimate, proposedGasLimit];
};
