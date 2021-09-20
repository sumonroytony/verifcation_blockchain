import web3 from "./web3";
import verifyJson from "./build/Verify.json";
const verify = new web3.eth.Contract(
  JSON.parse(verifyJson.interface),
<<<<<<< HEAD
  "0x94feafA4C93C823063f188e2eBb632324A18d371"
=======
  "0xfa3c5886B3c07Ae85746859d4FdFBC1c0695D03a"
>>>>>>> 16067ede9f4da9ffb6815d0c7720c5bb7e270cea
);

export default verify;
