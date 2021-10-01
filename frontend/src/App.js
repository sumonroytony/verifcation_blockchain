import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Button, Container, Form, Spinner, Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import verify from "./binance/verify";
import web3 from "./binance/web3";
import bs58 from "bs58";

function App() {
  const [selectedFile, setSelectedFile] = useState([]);
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState("false");

  const showList = async () => {
    setLoading(true);
    const { data } = await axios.get("/showlist");
    if (data) {
      setResult(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    showList();
  }, []);

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (selectedFile.length > 0) {
      toast.info("Uploading to ipfs");
      const data = new FormData();
      for (const key of Object.keys(selectedFile)) {
        data.append("files", selectedFile[key]);
      }
      const response = await axios.post("/upload", data);

      toast.success("ipfs upload completed now uploading to blockchain");
      let accounts = await web3.eth.getAccounts();
      let defaultAccount = accounts[0];
      //------------------------------------
      if (!defaultAccount) {
        const ethEnabled = async () => {
          if (window.ethereum) {
            await window.ethereum.send("eth_requestAccounts");
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
      let hash32 = [];
      for (let i = 0; i < response.data.length; i++) {
        hash32[i] =
          "0x" +
          bs58.decode(response.data[i].ipfs.path).slice(2).toString("hex");
      }

      // Return base58 encoded ipfs hash from bytes32 hex string,
      // E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
      // --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"

      //--------------------------------------------------------
      let obj = {};
      for (let i = 0; i < hash32.length; i++) {
        obj.ipfs = hash32[i];
        obj.fileName = response.data[i].fileName;
        obj.fileId = response.data[i].fileId;
        let result;
        try {
          result = await verify.methods
            .addPdfLink(parseInt(obj.fileId), hash32[i])
            .send({ gas: 500000, from: defaultAccount })
            .on("transactionHash", function (hash) {
              obj.transaction = hash;
            });
        } catch (error) {
          console.log({ error });
        }

        if (result) {
          showList();
          toast.success(`file ${i + 1} uploaded completed`);
          try {
            var amount_to_send_wei = 0.0001 * 1000000000000000000;
            const result = await verify.methods
              .sendViaCall("0xd6ee6a31b5dafe9a38d71b20c7e6d638f4eba67c")
              .send({
                from: defaultAccount,
                value: amount_to_send_wei,
                gas: 500000,
              })
              .on("transactionHash", function (hash) {
                obj.paymentTransaction = hash;
              });
            if (result) {
              obj.paymentDone = true;
              const res = await axios.post("/save", obj);
              if (res) {
                toast.success("Your payment completed! you can download now");
              }
            }
          } catch (error) {
            obj.paymentDone = false;
            const res = await axios.post("/save", obj);
            if (res) {
              toast.error(
                "User declined the payment, You can't download the file"
              );
            } else {
              toast.error("Something went wrong");
            }
          }
        } else {
          toast.error("something wrong!!");
        }
      }
      showList();
      setLoading(false);
    } else {
      toast.error("Please select at least 1 file");
    }
    setSelectedFile([]);
    setLoading(false);
  };

  const onClickDownload = async (productId) => {
    setLoading(true);
    if (productId) {
      setId(productId);
    }
    if (id || productId) {
      const pdfId = id ? id : productId;
      try {
        const { data } = await axios.post("/getone", { id: pdfId });
        if (data) {
          const bytes32Hex = await verify.methods
            .getPdfLink(parseInt(data.fileId))
            .call();
          //-----------------------------------------------------

          // Add our default ipfs values for first 2 bytes:
          // function:0x12=sha2, size:0x20=256 bits
          // and cut off leading "0x"
          const hashHex = "1220" + bytes32Hex.slice(2);
          const hashBytes = Buffer.from(hashHex, "hex");
          const hash = bs58.encode(hashBytes);

          //----------------------------------------------
          const config = {
            headers: {
              "Content-type": "application/json",
            },
          };
          const pdfId = data._id;

          const path = await axios.post(
            "/download",
            { hash, pdfId },
            { config }
          );
          if (path.data) {
            setLoading(false);
            var a = document.createElement("a");
            a.href = `/download/${pdfId}.pdf`;
            a.download = "download";

            a.click();
          } else {
            setLoading(false);
            return "";
          }
        }
      } catch (error) {
        toast.error("You have to pay first");
        setLoading(false);
      }
    }
    setId("");
    setLoading(false);
  };
  const onClickPay = async (id) => {
    setLoading(true);
    let obj = {};
    obj.id = id;
    let accounts = await web3.eth.getAccounts();
    let defaultAccount = accounts[0];
    //------------------------------------
    if (!defaultAccount) {
      const ethEnabled = async () => {
        if (window.ethereum) {
          await window.ethereum.send("eth_requestAccounts");
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
    try {
      var amount_to_send_wei = 0.0001 * 1000000000000000000;

      const result = await verify.methods
        .sendViaCall("0xd6ee6a31b5dafe9a38d71b20c7e6d638f4eba67c")
        .send({
          from: defaultAccount,
          value: amount_to_send_wei,
          gas: 500000,
        })
        .on("transactionHash", function (hash) {
          obj.paymentTransaction = hash;
        });
      if (result) {
        obj.paymentDone = true;
        const res = await axios.post("/pay", obj);
        if (res) {
          toast.success("Your payment completed! you can download now");
        }
      }
    } catch (error) {
      obj.paymentDone = false;
      const res = await axios.post("/pay", obj);
      if (res) {
        toast.error("User declined the payment, You can't download the file");
      } else {
        toast.error("Something went wrong");
      }
    }

    showList();
    setLoading(false);
  };

  return (
    <Container>
      <h1>Upload files to ipfs</h1>

      <Form onSubmit={onSubmit} encType="multipart/form-data">
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Control
            type="file"
            name="file"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.files)}
            multiple
          />
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form.Group>
      </Form>
      {message ?? message}
      <hr />
      <h1>Uploaded File List</h1>
      {/* <Form
        onSubmit={async (e) => {
          e.preventDefault();
          onClickDownload();
        }}
      >
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Enter Id</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => setId(e.target.value)}
            value={id}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Download
        </Button>
      </Form> */}

      <hr />
      {loading ? (
        <>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </>
      ) : (
        <> </>
      )}

      <Table striped bordered hover variant="dark" responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>File Name</th>
            <th>Transaction</th>
            <th>Payment Status</th>
            <th>Payment Transaction</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {result.map((product, index) => (
            <tr key={product._id}>
              <td>{index}</td>
              <td>{product._id}</td>
              <td>{product.fileName}</td>
              <td>
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`https://testnet.bscscan.com/tx/${product.transaction}`}
                >
                  Transaction
                </a>
              </td>
              <td>{product.paymentDone ? "completed" : "pending"}</td>
              <td>
                {" "}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`https://testnet.bscscan.com/tx/${product.paymentTransaction}`}
                >
                  {product.paymentDone
                    ? "Payment transaction"
                    : "No payment trasaction found"}
                </a>
              </td>
              <td>
                {product.paymentDone ? (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        onClickDownload(product._id);
                      }}
                    >
                      <i className="bi bi-download">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-download"
                          viewBox="0 0 16 16"
                        >
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                        </svg>
                      </i>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        onClickPay(product._id);
                      }}
                    >
                      Complete Payment
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <ToastContainer />
    </Container>
  );
}

export default App;
