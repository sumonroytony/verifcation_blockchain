const path = require('path');

const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(
    __dirname,
    'frontend',
    'src',
    'binance',
    'build'
);
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Verify.sol');

let source = fs.readFileSync(campaignPath, 'utf8');

const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]
    );
}
