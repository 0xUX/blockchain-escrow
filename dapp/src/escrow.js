import EscrowABI from './Escrow.abi.json';

//const CONTRACT_ADDRESS = '0x8D3bE215DCf9905cBe3F65f15a8F3DDAc85c1A5A'; // OLD On Rinkeby
const CONTRACT_ADDRESS = '0xa5388c8f64a6898b3b9fb5885baca6a36ffe2a08'; // On Rinkeby

const instance = (web3) => {
    return new web3.eth.Contract(
        JSON.parse(EscrowABI),
        CONTRACT_ADDRESS
    );
};

export default instance;
