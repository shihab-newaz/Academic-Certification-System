// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CertificateContract
 * @dev Manages the issuance, revocation, and verification of educational certificates on the blockchain.
 * This contract inherits from OpenZeppelin's Ownable and Pausable contracts for access control and emergency stop functionality.
 */
contract CertificateContract is Ownable, Pausable {
    struct Certificate {
        address recipient;
        string encryptedData;
        bytes32 dataHash;
        bytes signature;
        bool isIssued;
        bool isRevoked;
    }

    mapping(address => Certificate) public certificates;
    uint256 public totalCertificates;

    event CertificateIssued(address indexed recipient, uint256 timestamp);
    event CertificateRevoked(address indexed recipient, uint256 timestamp);

    /**
     * @dev Constructor that sets the owner of the contract to the deployer.
     * The contract starts in an unpaused state.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Issues a new certificate to a recipient.
     * @param recipient The address of the certificate recipient.
     * @param encryptedData The encrypted certificate data.
     * @param dataHash The hash of the certificate data.
     * @param signature The signature of the issuer.
     * @notice This function can only be called by the contract owner when the contract is not paused.
     * @notice Emits a CertificateIssued event upon successful issuance.
     */
    function issueCertificate(
        address recipient,
        string memory encryptedData,
        bytes32 dataHash,
        bytes memory signature
    ) public onlyOwner whenNotPaused {
        require(recipient != address(0), "Invalid recipient address");
        require(
            !certificates[recipient].isIssued ||
                certificates[recipient].isRevoked,
            "Certificate already issued and not revoked for this recipient"
        );

        certificates[recipient] = Certificate({
            recipient: recipient,
            encryptedData: encryptedData,
            dataHash: dataHash,
            signature: signature,
            isIssued: true,
            isRevoked: false
        });

        totalCertificates++;
        emit CertificateIssued(recipient, block.timestamp);
    }

    /**
     * @dev Revokes a previously issued certificate.
     * @param recipient The address of the certificate recipient whose certificate is to be revoked.
     * @notice This function can only be called by the contract owner when the contract is not paused.
     * @notice Emits a CertificateRevoked event upon successful revocation.
     */
    function revokeCertificate(
        address recipient
    ) public onlyOwner whenNotPaused {
        require(
            certificates[recipient].isIssued,
            "No active certificate found for this recipient"
        );
        require(
            !certificates[recipient].isRevoked,
            "Certificate already revoked"
        );

        certificates[recipient].isRevoked = true;
        totalCertificates--;
        emit CertificateRevoked(recipient, block.timestamp);
    }

    /**
     * @dev Verifies if a certificate is valid for a given recipient.
     * @param recipient The address of the certificate recipient.
     * @return bool True if the certificate is valid (issued and not revoked), false otherwise.
     */
    function verifyCertificate(address recipient) public view returns (bool) {
        require(recipient != address(0), "Invalid recipient address");
        return
            certificates[recipient].isIssued &&
            !certificates[recipient].isRevoked;
    }

    /**
     * @dev Retrieves the details of a certificate for a given student address.
     * @param studentAddress The address of the student whose certificate is to be viewed.
     * @return encryptedData The encrypted data of the certificate.
     * @return dataHash The hash of the certificate data.
     * @return signature The signature of the issuer.
     * @notice Reverts if no certificate is found or if the certificate has been revoked.
     */
    function viewCertificate(
        address studentAddress
    )
        public
        view
        returns (
            string memory encryptedData,
            bytes32 dataHash,
            bytes memory signature
        )
    {
        Certificate memory cert = certificates[studentAddress];
        require(
            cert.recipient == studentAddress,
            "No certificate found for this student"
        );
        require(!cert.isRevoked, "This certificate has been revoked");
        return (cert.encryptedData, cert.dataHash, cert.signature);
    }

    /**
     * @dev Returns the total number of active (non-revoked) certificates.
     * @return uint256 The count of active certificates.
     */
    function getCertificateCount() public view returns (uint256) {
        return totalCertificates;
    }

    /**
     * @dev Pauses the contract.
     * @notice This function can only be called by the contract owner.
     * @notice When paused, certificate issuance and revocation are disabled.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract.
     * @notice This function can only be called by the contract owner.
     * @notice When unpaused, certificate issuance and revocation are re-enabled.
     */
    function unpause() public onlyOwner {
        _unpause();
    }
}
