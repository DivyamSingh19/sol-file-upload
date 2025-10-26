import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Form, Button } from 'react-bootstrap';
import './Create.css'; // 👈 Add this CSS file

const pinataApi = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecret = process.env.REACT_APP_PINATA_SECRET_API_KEY;

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('');
  const [price] = useState('0.00001'); // Fixed price
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger form animation on mount
    setTimeout(() => setAnimate(true), 200);
  }, []);

  const uploadToPinata = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
      formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

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
    if (!image || !name || !description) {
      alert('All fields are required!');
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
      console.error('Contract instances not available.');
      return;
    }

    try {
      const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      console.log('Minting NFT with URI:', uri);

      const mintTx = await nft.mint(uri);
      await mintTx.wait();

      const id = await nft.tokenCount();
      const approvalTx = await nft.setApprovalForAll(marketplace.address, true);
      await approvalTx.wait();

      const listingPrice = ethers.formatEther(price.toString());
      const listTx = await marketplace.makeItem(nft.address, id, listingPrice);
      await listTx.wait();

      console.log('NFT stored safely in the vault!');
    } catch (error) {
      console.error('Error in mintThenList:', error);
    }
  };

  return (
    <div className={`vault-container ${animate ? 'fade-in' : ''}`}>
      <div className="vault-form">
        <h2 className="vault-title">🏦 Secure Your Digital Vault</h2>
        <Row className="g-4">
          <Form.Control type="file" required name="file" onChange={uploadToPinata} className="vault-input" />
          <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Vault Item Name" className="vault-input" />
          <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" className="vault-input" />
          <Form.Control value={price} readOnly size="lg" type="number" placeholder="Price in ETH (Fixed)" className="vault-input read-only" />
          <div className="d-grid px-0">
            <Button onClick={createNFT} variant="primary" size="lg" className="vault-button">
              💾 Store Safely in Vault
            </Button>
          </div>
        </Row>
      </div>
    </div>
  );
};

export default Create;
