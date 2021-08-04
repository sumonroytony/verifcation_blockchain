import web3 from './web3';
import verifyJson from './build/Verify.json';
const verify = new web3.eth.Contract(
    JSON.parse(verifyJson.interface),
    '0x20df983acFDa0e8FF9A0B97a5BdB39ccB27A9E8f'
);

export default verify;
