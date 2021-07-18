import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Container, Form } from 'react-bootstrap';
import verify from './binance/verify';
import web3 from './binance/web3';
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
        var accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        await verify.methods
            .addPdfLink(parseInt(id), response.data.path)
            .send({ from: defaultAccount });
        setMessage('blockchain upload completed');
    };

    const onClick = async () => {
        const pdf = await verify.methods.getPdfLink(parseInt(id)).call();
        const config = {
            headers: {
                'Content-type': 'application/json',
            },
        };

        const file = await axios.post('/download', { pdf }, { config });
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
            <button onClick={onClick}>Download</button>
        </Container>
    );
}

export default App;
