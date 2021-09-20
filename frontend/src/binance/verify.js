import web3 from "./web3";
import verifyJson from "./build/Verify.json";
const verify = new web3.eth.Contract(
  JSON.parse(verifyJson.interface),
  "0x94feafA4C93C823063f188e2eBb632324A18d371"
);

export default verify;
