const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const Verify = require('./contracts/build/Verify.json');

const provider = new HDWalletProvider(
    'vacuum brave material rough rain trade rate pizza burst stadium wrestle urban',
    'https://rinkeby.infura.io/v3/194f5a84623f458999b79300e3ac2546'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    const result = await new web3.eth.Contract(JSON.parse(Verify.interface))
        .deploy({ data: Verify.bytecode })
        .send({ gas: '1000000', from: accounts[0] });
    console.log('Contract deployed to', result.options.address);
};

deploy();
