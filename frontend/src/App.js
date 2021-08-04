import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Container, Form } from 'react-bootstrap';
import verify from './binance/verify';
import web3 from './binance/web3';
import bs58 from 'bs58';

function App() {
    const [selectedFile, setSelectedFile] = useState([]);
    const [id, setId] = useState('');
    const [message, setMessage] = useState('');
    const onSubmit = async (e) => {
        setMessage('Uploading to ipfs');
        e.preventDefault();
        const data = new FormData();
        for (const key of Object.keys(selectedFile)) {
            data.append('file', selectedFile[key]);
        }
        const response = await axios.post('/upload', data);
        setMessage('ipfs upload completed now uploading to blockchain');
        let accounts = await web3.eth.getAccounts();
        let defaultAccount = accounts[0];
        //------------------------------------
        if (!defaultAccount) {
            const ethEnabled = async () => {
                if (window.ethereum) {
                    await window.ethereum.send('eth_requestAccounts');
                    try {
                        window.web3(window.ethereum);
                    } catch (error) {
                        return true;
                    }
                    return true;
                }
                return false;
            };
            await ethEnabled();
            accounts = await web3.eth.getAccounts();
            defaultAccount = accounts[0];
        }
        //------------------------------------
        //------------------converting hash to 32bit-----------------------

        // Return bytes32 hex string from base58 encoded ipfs hash,
        // stripping leading 2 bytes from 34 byte IPFS hash
        // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
        // E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
        // "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"

        const hash32 =
            '0x' + bs58.decode(response.data.path).slice(2).toString('hex');
        console.log(hash32);

        // Return base58 encoded ipfs hash from bytes32 hex string,
        // E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
        // --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"

        //--------------------------------------------------------
        await verify.methods
            .addPdfLink(parseInt(id), hash32)
            .send({ from: defaultAccount });
        setMessage('blockchain upload completed');
    };

    const onClickDownload = async () => {
        const bytes32Hex = await verify.methods.getPdfLink(parseInt(id)).call();
        //-----------------------------------------------------

        // Add our default ipfs values for first 2 bytes:
        // function:0x12=sha2, size:0x20=256 bits
        // and cut off leading "0x"
        const hashHex = '1220' + bytes32Hex.slice(2);
        const hashBytes = Buffer.from(hashHex, 'hex');
        const hash = bs58.encode(hashBytes);

        //----------------------------------------------
        const config = {
            headers: {
                'Content-type': 'application/json',
            },
        };

        const path = await axios.post('/download', { hash }, { config });
        if (path.data) {
            window.open(`download/myFile.pdf`);
        }
    };

    return (
        <Container>
            <h1>Upload files to ipfs</h1>
            <form onSubmit={onSubmit} encType='multipart/form-data'>
                <input
                    type='file'
                    name='file'
                    onChange={(e) => setSelectedFile(e.target.files)}
                    multiple
                />
                <h1>Set Id</h1>
                <input
                    type='text'
                    name='id'
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                <button type='submit'>Submit</button>
            </form>
            {message ?? message}
            <hr />
            <h1>Download pdf</h1>
            <input
                type='text'
                name='id'
                value={id}
                onChange={(e) => setId(e.target.value)}
            />
            <button onClick={onClickDownload}>Download</button>
        </Container>
    );
}

export default App;
