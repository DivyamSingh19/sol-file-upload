import { useState } from 'react';
import { ethers } from 'ethers';
import { Row, Form, Button } from 'react-bootstrap';

const pinataApi = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecret = process.env.REACT_APP_PINATA_SECRET_API_KEY;

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const uploadToPinata = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({ name: file.name });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({ cidVersion: 0 });
      formData.append('pinataOptions', options);

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: pinataApi,
          pinata_secret_api_key: pinataSecret,
        },
        body: formData,
      });

      const result = await res.json();
      if (result.IpfsHash) {
        const imageUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
        setImage(imageUrl);
        console.log('Uploaded to Pinata:', imageUrl);
      }
    } catch (error) {
      console.error('Pinata upload error:', error);
    }
  };

  const createNFT = async () => {
    if (!image || !price || !name || !description) {
      alert("All fields are required!");
      return;
    }

    try {
      const metadata = { image, price, name, description };

      const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: pinataApi,
          pinata_secret_api_key: pinataSecret,
        },
        body: JSON.stringify(metadata),
      });

      const result = await res.json();
      if (result.IpfsHash) {
        await mintThenList(result.IpfsHash);
      }
    } catch (error) {
      console.error('Pinata metadata upload error:', error);
    }
  };

  const mintThenList = async (ipfsHash) => {
    if (!nft || !marketplace) {
      console.error("Contract instances not available.");
      return;
    }

    try {
      const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      console.log("Minting NFT with URI:", uri);
      
      const mintTx = await nft.mint(uri);
      await mintTx.wait();
      console.log("Mint successful!");

      const id = await nft.tokenCount();
      console.log("Token ID:", id.toString());

      const approvalTx = await nft.setApprovalForAll(marketplace.address, true);
      await approvalTx.wait();
      console.log("Approval granted to marketplace.");

      const listingPrice = ethers.utils.parseEther(price.toString());
      console.log("Listing NFT with price:", listingPrice.toString());

      const listTx = await marketplace.makeItem(nft.address, id, listingPrice);
      await listTx.wait();
      console.log("NFT listed successfully!");

    } catch (error) {
      console.error("Error in mintThenList:", error);
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control type="file" required name="file" onChange={uploadToPinata} />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
