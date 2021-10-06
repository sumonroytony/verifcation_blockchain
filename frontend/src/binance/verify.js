import web3 from "./web3";
import verifyJson from "./build/Verify.json";
const verify = new web3.eth.Contract(
  JSON.parse(verifyJson.interface),
  "0x6A13df0B0c3d8993C63F58BA3e3e7168e26f1E5A"
);

export default verify;
