import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { DefinetlySafeImagev2_backend } from 'declarations/DefinetlySafeImagev2_backend';
import "./styles/sendImage.css"
function SendImage({ principalId }) {
  const [imageFile, setImageFile] = useState(null);
  const [imageReceiverId, setImageReceiverId] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [passwordHash, setPasswordHash] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024) { // Check if file size is <= 1MB
      const reader = new FileReader();
      reader.onloadend = () => {
        const blob = new Blob([reader.result]);
        setImageFile(blob);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Image size should be 1MB or less");
    }
  };

  const handleSendImage = async () => {
    if (!imageReceiverId || !imageFile) {
      alert("Receiver ID and Image are required");
      return;
    }
    if (isLocked && !passwordHash) {
      alert("Password is required for locked images");
      return;
    }

    try {
      const receiverPrincipal = Principal.fromText(imageReceiverId);
      const senderPrincipal = Principal.fromText(principalId);
      const reader = new FileReader();

      reader.onloadend = async () => {
        const arrayBuffer = reader.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        await DefinetlySafeImagev2_backend.sendImage(senderPrincipal, receiverPrincipal, uint8Array, isLocked, passwordHash);
        alert("Image sent successfully!");
      };

      reader.readAsArrayBuffer(imageFile);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  return (
    <form action="#" onSubmit={(e) => e.preventDefault()}>

<div style={{ display: 'flex', height: '100vh',flexDirection:"column" }}>
        <div className='innerContainer'>
      <label htmlFor="receiverId">Receiver ID: &nbsp;</label>
      <input
           className='generalInput'
        id="receiverId"
        type="text"
        value={imageReceiverId}
        onChange={(e) => setImageReceiverId(e.target.value)}
      />
     </div>
     <div className='innerContainer'>
      <label htmlFor="image">Choose an image: &nbsp;</label>
      <input      className='generalInput' id="image" type="file" accept="image/*" onChange={handleImageChange} />
   
      </div>
      <div className='innerContainer'>
      <label>
        <input
        
          type="checkbox"
          checked={isLocked}
          onChange={() => setIsLocked(!isLocked)}
        />
        Lock Image
      </label>
      </div>
      {isLocked && (
        
          <div style={{ display: 'flex',flexDirection:"row",flexWrap:"column" ,marginTop:"15px"}}>
          <label htmlFor="password">Password: &nbsp;</label>
          <br/>
          <input
          className='generalInput'
            id="password"
            type="password"
            value={passwordHash}
            onChange={(e) => setPasswordHash(e.target.value)}
          />
          </div>
    
      )}
      <br />
      <button className='sendImgBtn' type="button" onClick={handleSendImage}>
        Send Image
      </button>
      </div>
    </form>
  );
}

export default SendImage;
