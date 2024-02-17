import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import IssueCertificateComponent from './Issue';
import RevokeCertificateComponent from './Revoke';
import ViewCertificateComponent from './View';
import ShareCertificateComponent from './share';
import VerifyCertificateComponent from './Verify';
import './css/App.css';


let Redirect = false; // Set to true after redirection

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
       IssueCertificateComponent(); // Issue the certificate
      Router.push('/view'); // Redirect to the view certificate page
      Redirect = true; // Update the flag after redirection
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Failed to issue certificate');
    }
  };


  return (
    <div>
    <nav className="navbar">
      <Link to="/">Certificate Issuance</Link>
      <Link to="/view">Viewer Portal</Link>
      <Link to="/verify">Certificate Verification</Link>
      <Link to="/revoke">Certificate Revocation</Link>
      <Link to="/share">Share Certificate</Link>
    </nav>

    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Routes>
        <Route exact path="/" element={<IssueCertificateComponent issueCertificateComponentAndRedirect={handleIssueCertificate} />} />
        <Route path="/view" element={<ViewCertificateComponent studentAddress={studentAddress} />} />
        <Route path="/verify" element={< VerifyCertificateComponent />} />
        <Route path="/revoke" element={<RevokeCertificateComponent />} />
        <Route path="/share" element={<ShareCertificateComponent />} />
      </Routes>
    </div>
  </div>

  );
}

export default App;




