import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { DefinetlySafeImagev2_backend } from 'declarations/DefinetlySafeImagev2_backend';

function ReceiveImage({ principalId }) {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  const fetchImages = async () => {
    try {
      const userPrincipal = Principal.fromText(principalId);
      const transactions = await DefinetlySafeImagev2_backend.getUserTransactions(userPrincipal);
      const userImages = transactions.map(tx => ({
        id: tx.sender.toText(), // Unique ID for each image
        thumbnailUrl: URL.createObjectURL(new Blob([tx.image], { type: 'image/jpeg' })),
        isLocked: tx.isLocked,
        imageUrl: '', // Initialize with empty URL
      }));

      setImages(userImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to fetch images.");
    }
  };

  useEffect(() => {
    if (principalId) {
      fetchImages();
    }
  }, [principalId]);

  const handleUnlockImage = async (imageId,indexGallery) => {

    const enteredPassword = prompt('Enter password for locked image :');
    if (enteredPassword) {
      try {
        const imageBlob = await DefinetlySafeImagev2_backend.receiveImage(
          Principal.fromText(imageId),
          Principal.fromText(principalId),
          true,
          enteredPassword
        );

        if (imageBlob.byteLength > 0) {
          const imageUrl = URL.createObjectURL(new Blob([imageBlob], { type: 'image/jpeg' }));
          setImages(prevImages =>
            prevImages.map((img,index) =>
          
              index === indexGallery
                ? { ...img, imageUrl: imageUrl, isLocked: false } // Update only the specific image
                : img
            )
          );
        } else {
          alert("Incorrect password or failed to fetch image.");
        }
      } catch (error) {
        setError("Incorrect password or failed to fetch image.");
        console.error("Error receiving image:", error);
      }
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {images.length === 0 ? (
          <p>No images found.</p>
        ) : (
          images.map((image, index) => (
            <div key={index} style={{ margin: '10px', position: 'relative' }}>
              {image.isLocked ? (
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => handleUnlockImage(image.id,index)}
                >
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt="Unlocked"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      borderRadius: '50%',
                      padding: '10px',
                      fontSize: '24px',
                    }}>
                      🔒
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={image.thumbnailUrl} // Use image URL for non-locked images
                  alt="User Image"
                  style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReceiveImage;
