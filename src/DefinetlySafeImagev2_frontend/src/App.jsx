import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import SendImage from './SendImage';
import ReceiveImage from './ReceiveImage';
import Header from './Header';

import   "./styles/app.css"
function App() {
  const [principalId, setPrincipalId] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
          const identity = await authClient.getIdentity();
          const principal = identity.getPrincipal();
          setPrincipalId(principal.toText());
          setLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: 'https://identity.ic0.app',
        onSuccess: async () => {
          const identity = await authClient.getIdentity();
          const principal = identity.getPrincipal();
          setPrincipalId(principal.toText());
          setLoggedIn(true);
        },
        onError: (error) => {
          console.error('Login failed:', error);
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh',flexDirection:"column" }}>
      <Header/>
      <div style={{ display: 'flex', height: '100vh',flexDirection:"row" ,marginTop:"25px",borderWidth:"2px",borderColor:"white",borderStyle:"solid",flexWrap:"nowrap"}}>
      <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
        <div style={{position:"absolute" ,top:"20px",left:"25vw",fontSize:"1.2vw"}}>
          {loggedIn && (
            <div>
              <strong>Your Internet Identity:</strong> {principalId}
            </div>
          )}
        </div>
        <h2>Send Image</h2>
        <hr style={{width:"200%",marginBottom:"30px",margin:"auto"}}/>
        {!loggedIn ? (
          <div>
            <h3>Please log in to use the app</h3>
            <button className='loginBtn' onClick={handleLogin}>Login with Internet Identity</button>
          </div>
        ) : (
          <SendImage principalId={principalId} />
        )}
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>My Gallery</h2>
        {loggedIn ? <ReceiveImage principalId={principalId} /> : <p>Please log in to view images.</p>}
      </div>
      </div>
    </div>
  );
}

export default App;
