const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const { create } = require("ipfs-http-client");
const mongoose = require("mongoose");
const findRemoveSync = require("find-remove");
const fs = require("fs");

dotenv.config();
const crypto = require("crypto");
const mkdirp = require("mkdirp");
const algorithm = "aes-256-ctr";
const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
const iv = crypto.randomBytes(16);
const dirname = path.resolve();
const Binance = require("./Model");
var dir = "uploads/";
try {
  fs.mkdirSync(dir);
} catch (e) {
  if (e.code != "EEXIST") throw e;
}
const upload = multer({ dest: "uploads/" });
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected : ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};
connectDB();
////hashing
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted;
};

//////hashing end
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());

app.post("/save", async (req, res, next) => {
  const {
    ipfs,
    fileName,
    fileId,
    transaction,
    paymentDone,
    paymentTransaction,
  } = req.body;
  const saveToDb = await Binance.create({
    ipfs,
    fileName,
    fileId,
    transaction,
    paymentDone,
    paymentTransaction,
  });
  if (saveToDb) {
    res.status(200).json({ saveToDb });
  } else {
    console.log(error);
  }
});

app.post("/getone", async (req, res, next) => {
  const { id } = req.body;
  const result = await Binance.findOne({ _id: id });
  if (result.paymentDone) {
    res.json(result);
  } else {
    res.status(400).json("you have to pay first");
  }
});

app.get("/showlist", async (req, res, next) => {
  const result = await Binance.find();
  res.json(result);
});

app.post("/upload", upload.array("files", 10), async (req, res, next) => {
  try {
    findRemoveSync(path.join(dirname, "/uploads"), {
      age: { seconds: 10 },
      files: "*.*",
    });
  } catch (error) {
    console.log(error);
  }
  //infura project id
  const PROJECTID = "1uyqqYd0iMxbMdBu3Vjeb2sSdJd";
  const PROJECTSECRET = "56296c0362cb47f2bc6c9c719cce4919";
  const auth =
    "Basic " + Buffer.from(PROJECTID + ":" + PROJECTSECRET).toString("base64");
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  let response = [];
  const binance = await Binance.findOne().sort({ _id: -1 }).limit(1);
  let id = 0;
  binance ? (id = binance.fileId) : (id = 0);

  for (let i = 0; i < req.files.length; i++) {
    let obj = {};
    const preEncryption = encrypt(
      Buffer.from(fs.readFileSync(req.files[i].path))
    );
    const finalEncryption = `${preEncryption.iv} ${preEncryption.content}`;

    obj.ipfs = await ipfs.add(finalEncryption, function (err, file) {
      if (err) {
        console.log(err);
      }
    });
    obj.fileName = req.files[i].originalname;

    id++;
    obj.fileId = id;
    response.push(obj);
  }
  res.send(response);
});

app.post("/download", async (req, res, next) => {
  try {
    findRemoveSync(`${dirname}/frontend/build/download`, {
      age: { seconds: 10 },
      files: "*.*",
    });
  } catch (error) {
    console.log(error);
  }
  var dir = "frontend/public/download/";
  try {
    fs.mkdirSync(dir);
  } catch (e) {
    if (e.code != "EEXIST") throw e;
  }
  const ipfsHash = req.body.hash;
  const id = req.body.pdfId;
  //for decrypt
  const path = await axios.post(
    `https://ipfs.infura.io:5001/api/v0/cat?arg=${ipfsHash}`
  );
  const myStr = path.data.split(" ");
  const hash = {};
  hash.iv = myStr[0];
  hash.content = myStr[1];

  //data.push(Buffer.from(fs.readFileSync(file.path)));
  var dir = "frontend/public/download/";
  try {
    fs.mkdirSync(dir);
  } catch (e) {
    if (e.code != "EEXIST") throw e;
  }
  const decryptbuffer = decrypt(hash);
  //res.json(response);
  fs.writeFile(`frontend/build/download/${id}.pdf`, decryptbuffer, (err) => {
    if (!err) console.log("Data written");
  });
  // end decrypt
  res.status(200).json({
    path: `frontend/build/download/${id}`,
  });
});

app.post("/pay", async (req, res, next) => {
  const { id, paymentDone, paymentTransaction } = req.body;
  const pdf = await Binance.findById(id);
  if (pdf) {
    pdf.paymentDone = paymentDone;
    pdf.paymentTransaction = paymentTransaction;
    const result = await pdf.save();
    if (result) {
      return res.status(200).json("payment updated successfully");
    } else {
      return res.status(400).json("Payment not completed");
    }
  } else {
    res.status(400).json("pdf not found");
  }
});

app.use(express.static(path.join(dirname, "/frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.resolve(dirname, "frontend", "build", "index.html"))
);

const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server running on port ${process.env.port} `));
