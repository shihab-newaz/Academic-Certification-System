import { PinataSDK } from "pinata";
import dotenv from 'dotenv';

dotenv.config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY || "gateway.pinata.cloud"
});

async function uploadToIPFS(data) {
  try {
    const jsonString = JSON.stringify(data);
    console.log('Data being uploaded to IPFS:', jsonString);
    
    const file = new File([jsonString], 'data.json', { type: 'application/json' });

    const result = await pinata.upload.file(file);
    console.log(`Data uploaded to Pinata with CID: ${result.IpfsHash}`);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

async function fetchFromIPFS(cid) {
  try {
    const response = await pinata.gateways.get(cid);
    console.log(`Successfully fetched CID: ${cid} from Pinata`);
    // console.log('Raw response received:', response);
    
    let certificateData;
    if (typeof response === 'object' && response !== null && 'data' in response) {
      certificateData = response.data;
    } else {
      throw new Error('Unexpected data structure received from IPFS');
    }  
    return certificateData;
  } catch (error) {
    console.error(`Error fetching from Pinata: ${error}`);
    throw error;
  }
}

export { uploadToIPFS, fetchFromIPFS };