import React, { useState, useEffect,useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import IssueCertificateComponent from './Issue';

import ViewCertificateComponent from './View';
import { useLocation } from 'react-router-dom';


let Redirect = false; // Set to true after redirection

//peer identity: 12D3KooWAidW1MSzzaQc4VbjB4V3yg3XYKBQ6pHVNr4eS4XPsGpt
// ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
// ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

function App() {
  const [studentAddress, setStudentAddress] = useState('');
 
  const pathname = useLocation().pathname; // Use the useLocation hook inside the App function

  // Update the flag when visiting the `/view` route
  useEffect(() => {
    if (pathname === '/view') {
      Redirect = false;
    } else if (pathname === '/') {
      Redirect = true;
    }
  }, [pathname]);

  // Handle issue certificate and redirect to view certificate page
  const handleIssueCertificate = async () => {
    try {
      await IssueCertificateComponent(); // Issue the certificate
      Router.push('/view'); // Redirect to the view certificate page
      Redirect = true; // Update the flag after redirection
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Failed to issue certificate');
    }
  };


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',

    }}>
      <Routes>
        <Route exact path="/" element={<IssueCertificateComponent issueCertificateComponentAndRedirect={handleIssueCertificate} />} />
        <Route path="/view" element={<ViewCertificateComponent studentAddress={studentAddress}  />} />


      </Routes>


      {/* Conditional rendering based on the flag */}
      {Redirect === false &&
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Link to="/view">
            <button style={{marginBottom:10}}>Go to View</button>
          </Link>
        </div>
      }

      {Redirect === true &&
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Link to="/">
            <button style={{marginBottom:10}}>Go to Issuance</button>
          </Link>
        </div>
      }

    </div>
  );
}

export default App;




