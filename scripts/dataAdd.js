import { issueCertificate } from './interact'; // Import the function to issue certificates


const [issueResult, setIssueResult] = useState('');

useEffect(() => {
  async function runIssueCertificate() {
    try {
      const result = await issueCertificate("Alice", "BSC", "Mathematics", "0xdaa23B8CD5Bc84Ff55F1eAc6A9D5929D67d9D1cf", Math.floor(Date.now() / 1000));
      setIssueResult(result);
    } catch (error) {
      console.error('Error issuing certificate:', error);
      setIssueResult('Failed to issue certificate');
    }
  }

  runIssueCertificate();
}, []);

