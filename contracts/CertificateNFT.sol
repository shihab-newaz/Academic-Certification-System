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
        uint256 expiration;
        bool isIssued;
        bool isRevoked;
        string fileCID;
        bytes signature;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => address[]) public sharedCertificates;
    address[] public recipients;

    //event CertificateIssued(bytes32 indexed certificateHash,address indexed recipient);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the University can call this function"
        );
        _;
    }

    function issueCertificate(
        string memory name,
        string memory roll,
        string memory degreeName,
        string memory subject,
        address recipient,
        uint256 timestamp,
        uint256 expiration,
        string memory fileCID,
        bytes memory signature
    ) public onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        recipients.push(recipient);
        bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            !certificates[certificateHash].isIssued ||
                certificates[certificateHash].isRevoked,
            "Certificate already issued or revoked for this recipient"
        );
        certificates[certificateHash] = Certificate(
            name,
            roll,
            degreeName,
            subject,
            recipient,
            timestamp,
            expiration,
            true,
            false,
            fileCID,
            signature
        );
        //emit CertificateIssued(certificateHash, recipient);
    }

    function verifyCertificate(address recipient) public view returns (bool) {
        require(recipient != address(0), "Invalid recipient address");
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
        require(
            msg.sender == owner,
            "Only the University can revoke certificates"
        );
        bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[certificateHash].isIssued,
            "Certificate not issued or already revoked"
        );
        certificates[certificateHash].isRevoked = true;
    }

    function viewCertificate(
        address studentAddress
    )
        public
        view
        returns (
            string memory name,
            string memory roll,
            string memory degreeName,
            string memory subject,
            uint256 timestamp,
            uint256 expiration,
            string memory fileCID,
            bytes memory signature
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
            certificates[certificateHash].expiration,
            certificates[certificateHash].fileCID,
            certificates[certificateHash].signature
        );
    }

    function getAllCertificates() public view returns (Certificate[] memory) {
        Certificate[] memory issuedCertificates = new Certificate[](
            recipients.length
        );
        for (uint i = 0; i < recipients.length; i++) {
            bytes32 certificateHash = keccak256(
                abi.encodePacked(recipients[i])
            );
            issuedCertificates[i] = certificates[certificateHash];
        }
        return issuedCertificates;
    }

    function shareCertificate(address recipient, address to) public onlyOwner {
        bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[certificateHash].isIssued,
            "Certificate not issued"
        );
        require(
            !certificates[certificateHash].isRevoked,
            "Certificate is revoked"
        );
        sharedCertificates[certificateHash].push(to);
    }

    function isCertificateSharedWith(
        address recipient,
        address with
    ) public view returns (bool) {
        bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        address[] memory sharedWith = sharedCertificates[certificateHash];
        for (uint i = 0; i < sharedWith.length; i++) {
            if (sharedWith[i] == with) {
                return true;
            }
        }
        return false;
    }
}
