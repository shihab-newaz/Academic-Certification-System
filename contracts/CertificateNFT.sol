// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateNFT {
    address public owner;

    struct Certificate {
        address recipient;
        string encryptedData;
        bytes32 dataHash;
        bytes signature;
        bool isIssued;
        bool isRevoked;
    }

    mapping(address => Certificate) public certificates;
    mapping(address => address[]) public sharedCertificates;
    address[] public recipients;

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
        address recipient,
        string memory encryptedData,
        bytes32 dataHash,
        bytes memory signature
    ) public onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        recipients.push(recipient);
        //bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            !certificates[recipient].isIssued ||
                certificates[recipient].isRevoked,
            "Certificate already issued or revoked for this recipient"
        );
        certificates[recipient] = Certificate(
            recipient,
            encryptedData,
            dataHash,
            signature,
            true,
            false
        );
    }

    function verifyCertificate(address recipient) public view returns (bool) {
        require(recipient != address(0), "Invalid recipient address");
        //bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[recipient].recipient == recipient,
            "No certificate found for this recipient"
        );
        return
            certificates[recipient].isIssued &&
            !certificates[recipient].isRevoked;
    }

    function revokeCertificate(address recipient) public onlyOwner {
        require(
            msg.sender == owner,
            "Only the University can revoke certificates"
        );
        //bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[recipient].isIssued,
            "Certificate not issued or already revoked"
        );
        certificates[recipient].isRevoked = true;
    }

    function viewCertificate(
        address studentAddress
    ) public view returns (string memory encryptedData, bytes32 dataHash, bytes memory signature) {
        require(
            certificates[studentAddress].recipient == studentAddress,
            "No certificate found for this student"
        );

        require(
            !certificates[studentAddress].isRevoked,
            "This certificate has been revoked"
        );
        return (
            certificates[studentAddress].encryptedData,
            certificates[studentAddress].dataHash,
            certificates[studentAddress].signature
        );
    }

    function updateCertificate(
        address recipient,
        string memory encryptedData,
        bytes32 dataHash,
        bytes memory signature
    ) public  {
        require(recipient != address(0), "Invalid recipient address");
        //bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[recipient].isIssued &&
                !certificates[recipient].isRevoked,
            "Certificate not issued or already revoked for this recipient"
        );

        Certificate storage certificateToUpdate = certificates[recipient];

        certificateToUpdate.encryptedData = encryptedData;
        certificateToUpdate.dataHash = dataHash;
        certificateToUpdate.signature = signature;
    }

    function getAllCertificates() public view returns (Certificate[] memory) {
        Certificate[] memory issuedCertificates = new Certificate[](
            recipients.length
        );
        for (uint i = 0; i < recipients.length; i++) {
            // bytes32 certificateHash = keccak256(
            //     abi.encodePacked(recipients[i])
            // );
            issuedCertificates[i] = certificates[recipients[i]];
        }
        return issuedCertificates;
    }

    function shareCertificate(
        address student,
        address employer
    ) public onlyOwner {
        //bytes32 certificateHash = keccak256(abi.encodePacked(student));
        require(certificates[student].isIssued, "Certificate not issued");
        require(!certificates[student].isRevoked, "Certificate is revoked");
        sharedCertificates[student].push(employer);
    }

    function isCertificateSharedWith(
        address student,
        address employer
    ) public view returns (bool) {
        //bytes32 certificateHash = keccak256(abi.encodePacked(student));
        address[] memory sharedWith = sharedCertificates[student];
        for (uint i = 0; i < sharedWith.length; i++) {
            if (sharedWith[i] == employer) {
                return true;
            }
        }
        return false;
    }

function unshareCertificate(address student, address employer) public onlyOwner {
    require(certificates[student].isIssued, "Certificate not issued");
    require(!certificates[student].isRevoked, "Certificate is revoked");

    address[] storage sharedWith = sharedCertificates[student];
    for (uint i = 0; i < sharedWith.length; i++) {
        if (sharedWith[i] == employer) {
            // Remove the employer from the shared list
            sharedWith[i] = sharedWith[sharedWith.length - 1];
            sharedWith.pop();
            return;
        }
    }
    revert("Certificate not shared with this employer");
}
}