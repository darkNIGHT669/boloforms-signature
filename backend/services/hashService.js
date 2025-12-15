/**
 * Hash Service - SHA-256 Hashing for Audit Trail
 * Location: backend/services/hashService.js
 */

const crypto = require('crypto');

/**
 * Calculate SHA-256 hash of a buffer
 * @param {Buffer} buffer - PDF buffer
 * @returns {string} Hex string of hash
 */
const calculateHash = (buffer) => {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
};

/**
 * Verify hash matches buffer
 * @param {Buffer} buffer - PDF buffer
 * @param {string} expectedHash - Expected hash
 * @returns {boolean} True if hash matches
 */
const verifyHash = (buffer, expectedHash) => {
  const actualHash = calculateHash(buffer);
  return actualHash === expectedHash;
};

module.exports = {
  calculateHash,
  verifyHash,
};