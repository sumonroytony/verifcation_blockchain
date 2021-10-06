import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  web3 = new Web3(window.web3.currentProvider);
} else {
  const provider = new Web3.providers.HttpProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );
  web3 = new Web3(provider);
}

// const BSCOptions = {
//     /* Smart Chain mainnet RPC URL */
//     rpcUrl: 'https://bsc-dataseed.binance.org/',
//     chainId: 56 // Smart Chain mainnet chain id
//   }

//   // Setting network to Smart Chain
//   const fm = new Fortmatic('YOUR_LIVE_API_KEY', BSCOptions);
//   window.web3 = new Web3(fm.getProvider());

export default web3;
