import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { DefinetlySafeImagev2_backend } from 'declarations/DefinetlySafeImagev2_backend';

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
      <label htmlFor="receiverId">Receiver ID: &nbsp;</label>
      <input
        id="receiverId"
        type="text"
        value={imageReceiverId}
        onChange={(e) => setImageReceiverId(e.target.value)}
      />
      <br />
      <label htmlFor="image">Choose an image: &nbsp;</label>
      <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
      <br />
      <label>
        <input
          type="checkbox"
          checked={isLocked}
          onChange={() => setIsLocked(!isLocked)}
        />
        Lock Image
      </label>
      {isLocked && (
        <>
          <br />
          <label htmlFor="password">Password: &nbsp;</label>
          <input
            id="password"
            type="password"
            value={passwordHash}
            onChange={(e) => setPasswordHash(e.target.value)}
          />
        </>
      )}
      <br />
      <button type="button" onClick={handleSendImage}>
        Send Image
      </button>
    </form>
  );
}

export default SendImage;
