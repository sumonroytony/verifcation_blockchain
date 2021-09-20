import web3 from "./web3";
import verifyJson from "./build/Verify.json";
const verify = new web3.eth.Contract(
  JSON.parse(verifyJson.interface),
  "0xfa3c5886B3c07Ae85746859d4FdFBC1c0695D03a"
);

export default verify;
