// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateNFT {
    address public owner;

    struct Certificate {
        string name;
        string roll;
        string degreeName;
        string subject;
        address recipient;
        uint256 timestamp;
        bool isIssued;
        bool isRevoked;
        string fileCID;
        //bytes32 signature;
    }

    mapping(bytes32 => Certificate) public certificates;

    //event CertificateIssued(bytes32 indexed certificateHash,address indexed recipient);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function issueCertificate(
        string memory name,
        string memory roll,
        string memory degreeName,
        string memory subject,
        address recipient,
        uint256 timestamp,
        string memory fileCID
    ) public onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            !certificates[certificateHash].isIssued||certificates[certificateHash].isRevoked,
            "Certificate already issued or revoked for this recipient"
        );
        certificates[certificateHash] = Certificate(
            name,
            roll,
            degreeName,
            subject,
            recipient,
            timestamp,
            true,
            false,
            fileCID
        );
        //emit CertificateIssued(certificateHash, recipient);
    }

    function verifyCertificate(address recipient) public view returns (bool) {
        bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[certificateHash].recipient == recipient,
            "No certificate found for this recipient"
        );
        return
            certificates[certificateHash].isIssued &&
            !certificates[certificateHash].isRevoked;
    }

    function revokeCertificate(address recipient) public onlyOwner {
        bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[certificateHash].isIssued,
            "Certificate not issued or already revoked"
        );
        certificates[certificateHash].isRevoked = true;
    }

    function viewCertificate(address studentAddress )
        public
        view
        returns (
            string memory name,
            string memory roll,
            string memory degreeName,
            string memory subject,
            uint256 timestamp,
            string memory fileCID
        )
    {
        bytes32 certificateHash = keccak256(abi.encodePacked(studentAddress));
        require(
            certificates[certificateHash].recipient == studentAddress,
            "No certificate found for this student"
        );

            require(
        !certificates[certificateHash].isRevoked,
        "This certificate has been revoked"
    );
        return (
            certificates[certificateHash].name,
            certificates[certificateHash].roll,
            certificates[certificateHash].degreeName,
            certificates[certificateHash].subject,
            certificates[certificateHash].timestamp,
            certificates[certificateHash].fileCID
        );
    }
}
