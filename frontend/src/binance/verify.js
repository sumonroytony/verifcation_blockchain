import web3 from './web3';
import verifyJson from './build/Verify.json';
const verify = new web3.eth.Contract(
  JSON.parse(verifyJson.interface),
  '0xD5D4c3d90162c632B0ba15BCF114107Ad6CBCD49'
);

export default verify;
