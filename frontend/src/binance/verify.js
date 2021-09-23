import web3 from "./web3";
import verifyJson from "./build/Verify.json";
const verify = new web3.eth.Contract(
  JSON.parse(verifyJson.interface),
  "0x6eFb39fD4e3126F517Da8b578a07053fffaDf839"
);

export default verify;
