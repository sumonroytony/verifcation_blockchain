const Web3 = require("web3");

const HDWalletProvider = require("truffle-hdwallet-provider");

const compiledCampaign = require("./contracts/build/Verify.json");

const provider = new HDWalletProvider(
  "bus give smart sister anchor cargo tilt together book stairs accuse twenty",
  "https://data-seed-prebsc-1-s1.binance.org:8545"
);

const web3 = new Web3(provider);

const deploy = async () => {
  console.log("hee");
  console.log(await web3.eth.getAccounts());
  const accounts = await web3.eth.getAccounts();
  console.log("hedfasdfase");

  console.log("Attempting to deploy from account", accounts[0], "ggggggggggg");

  const result = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface)
  )
    .deploy({
      data: "0x" + compiledCampaign.bytecode,
    })
    .send({ gas: 1000000, from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
};

deploy();
