import web3 from './web3';
import verifyJson from './build/Verify.json';
const verify = new web3.eth.Contract(
    JSON.parse(verifyJson.interface),
    '0x31AB2711eEE96Bae25C0531fcb92D06853d4bA45'
);

export default verify;
