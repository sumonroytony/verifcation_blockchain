const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const multer = require('multer');
const bodyParser = require('body-parser');
const { create } = require('ipfs-http-client');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
dotenv.config();
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);
////hashing
const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
    };
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(
        algorithm,
        secretKey,
        Buffer.from(hash.iv, 'hex')
    );

    const decrpyted = Buffer.concat([
        decipher.update(Buffer.from(hash.content, 'hex')),
        decipher.final(),
    ]);

    return decrpyted;
};

//////hashing end
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/upload', upload.array('file', 10), async (req, res, next) => {
    //infura project id
    const PROJECTID = '1uyqqYd0iMxbMdBu3Vjeb2sSdJd';
    const PROJECTSECRET = '56296c0362cb47f2bc6c9c719cce4919';
    const auth =
        'Basic ' +
        Buffer.from(PROJECTID + ':' + PROJECTSECRET).toString('base64');
    const ipfs = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });

    let response;
    for (let i = 0; i < req.files.length; i++) {
        const preEncryption = encrypt(
            Buffer.from(fs.readFileSync(req.files[i].path))
        );
        const finalEncryption = `${preEncryption.iv} ${preEncryption.content}`;

        response = await ipfs.add(finalEncryption, function (err, file) {
            if (err) {
                console.log(err);
            }
        });
    }
    res.send(response);
});

app.post('/download', async (req, res, next) => {
    const ipfsHash = req.body.hash;
    //for decrypt
    const path = await axios.post(
        `https://ipfs.infura.io:5001/api/v0/cat?arg=${ipfsHash}`
    );
    const myStr = path.data.split(' ');
    const hash = {};
    hash.iv = myStr[0];
    hash.content = myStr[1];

    //data.push(Buffer.from(fs.readFileSync(file.path)));

    const decryptbuffer = decrypt(hash);
    //res.json(response);
    fs.writeFile(
        'frontend/public/download/myFile.pdf',
        decryptbuffer,
        (err) => {
            if (!err) console.log('Data written');
        }
    );
    // end decrypt
    res.status(200).json({
        path: 'frontend/public/download/myFile.pdf',
    });
});
const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server running on port ${process.env.port} `));
