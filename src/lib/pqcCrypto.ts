/**
 * QuantumShield - Post-Quantum Cryptographic Engine
 * Implements:
 * - NIST FIPS 203 ML-KEM-768 (Lattice-based Key Encapsulation Mechanism)
 * - NIST FIPS 204 ML-DSA-65 (Lattice-based Digital Signature Algorithm)
 * - RFC 5869 HKDF-SHA256 Dual Hybrid Key Derivation (ECDH + ML-KEM)
 * - AES-256-GCM Authenticated Encryption with Associated Data (AEAD)
 */

import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Real NIST FIPS 203 ML-KEM-768 Implementation
 * Wire invariants:
 * - Public Key: 1,184 bytes
 * - Secret Key: 2,400 bytes
 * - Ciphertext: 1,088 bytes
 * - Shared Secret: 32 bytes
 */
export class MLKEM768Engine {
  readonly PUBLIC_KEY_BYTES = 1184;
  readonly PRIVATE_KEY_BYTES = 2400;
  readonly CIPHERTEXT_BYTES = 1088;
  readonly SHARED_SECRET_BYTES = 32;

  /**
   * Deterministic or CSPRNG Key Generation
   * @param seed Optional 64-byte seed (d || z)
   */
  generateKeyPair(seed?: Uint8Array): { publicKey: Uint8Array; privateKey: Uint8Array } {
    let keyPair;
    if (seed) {
      const formattedSeed = seed.length === 64 ? seed : new Uint8Array(64);
      if (seed.length !== 64) formattedSeed.set(seed.slice(0, 64));
      keyPair = ml_kem768.keygen(formattedSeed);
    } else {
      keyPair = ml_kem768.keygen();
    }
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.secretKey
    };
  }

  /**
   * Encapsulate a shared secret to the recipient's public key
   * @param publicKey Recipient's 1,184-byte ML-KEM-768 public key
   */
  encapsulate(publicKey: Uint8Array): { ciphertext: Uint8Array; sharedSecret: Uint8Array } {
    if (publicKey.length !== this.PUBLIC_KEY_BYTES) {
      throw new Error(`Invalid ML-KEM-768 public key size: expected ${this.PUBLIC_KEY_BYTES}, received ${publicKey.length}`);
    }
    const result = ml_kem768.encapsulate(publicKey);
    return {
      ciphertext: result.cipherText,
      sharedSecret: result.sharedSecret
    };
  }

  /**
   * Decapsulate shared secret using private key
   * Follows FIPS 203 §7.3 implicit rejection on invalid ciphertexts
   * @param ciphertext 1,088-byte ciphertext
   * @param privateKey 2,400-byte private key
   */
  decapsulate(ciphertext: Uint8Array, privateKey: Uint8Array): Uint8Array {
    if (ciphertext.length !== this.CIPHERTEXT_BYTES) {
      throw new Error(`Invalid ML-KEM-768 ciphertext size: expected ${this.CIPHERTEXT_BYTES}, received ${ciphertext.length}`);
    }
    if (privateKey.length !== this.PRIVATE_KEY_BYTES) {
      throw new Error(`Invalid ML-KEM-768 secret key size: expected ${this.PRIVATE_KEY_BYTES}, received ${privateKey.length}`);
    }
    return ml_kem768.decapsulate(ciphertext, privateKey);
  }
}

/**
 * Backward compatibility alias so existing components seamlessly execute real lattice math
 */
export class MLKEM768Simulator extends MLKEM768Engine {}

/**
 * Real NIST FIPS 204 ML-DSA-65 Implementation
 * Wire invariants:
 * - Public Key: 1,952 bytes
 * - Secret Key: 4,032 bytes
 * - Signature: 3,309 bytes
 */
export class MLDSA65Engine {
  readonly PUBLIC_KEY_BYTES = 1952;
  readonly PRIVATE_KEY_BYTES = 4032;
  readonly SIGNATURE_BYTES = 3309;

  /**
   * Generate keypair from optional 32-byte seed or CSPRNG
   */
  generateKeyPair(seed?: Uint8Array): { publicKey: Uint8Array; privateKey: Uint8Array } {
    let keyPair;
    if (seed) {
      const formattedSeed = seed.length === 32 ? seed : seed.slice(0, 32);
      keyPair = ml_dsa65.keygen(formattedSeed);
    } else {
      keyPair = ml_dsa65.keygen();
    }
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.secretKey
    };
  }

  /**
   * Sign message using ML-DSA-65 secret key
   */
  sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
    if (privateKey.length !== this.PRIVATE_KEY_BYTES) {
      throw new Error(`Invalid ML-DSA-65 secret key size: expected ${this.PRIVATE_KEY_BYTES}, received ${privateKey.length}`);
    }
    return ml_dsa65.sign(message, privateKey);
  }

  /**
   * Verify signature using ML-DSA-65 public key
   */
  verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean {
    if (publicKey.length !== this.PUBLIC_KEY_BYTES) {
      return false;
    }
    if (signature.length !== this.SIGNATURE_BYTES) {
      return false;
    }
    try {
      return ml_dsa65.verify(signature, message, publicKey);
    } catch {
      return false;
    }
  }
}

/**
 * Derive Hybrid Session Key using RFC 5869 HKDF-SHA256
 * Combines Classical ECDH Shared Secret (X25519/P-256) + NIST ML-KEM-768 Shared Secret
 */
export async function deriveHybridSessionKey(
  ecdhSecret: Uint8Array,
  pqSecret: Uint8Array,
  salt: Uint8Array = new Uint8Array(32)
): Promise<Uint8Array> {
  const combinedSecret = new Uint8Array(ecdhSecret.length + pqSecret.length);
  combinedSecret.set(ecdhSecret, 0);
  combinedSecret.set(pqSecret, ecdhSecret.length);

  const encoder = new TextEncoder();
  const info = encoder.encode("QuantumShield-Hybrid-X25519-MLKEM768-HKDF-SHA256");

  // Pure cryptographic HKDF-SHA256
  return hkdf(sha256, combinedSecret, salt, info, 32);
}

/**
 * AES-256-GCM Authenticated Encryption
 */
export async function encryptAESGCM(
  plaintext: string,
  keyBytes: Uint8Array
): Promise<{ ciphertextHex: string; ivHex: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    cryptoKey,
    encoder.encode(plaintext)
  );

  return {
    ciphertextHex: bytesToHex(new Uint8Array(encrypted)),
    ivHex: bytesToHex(iv)
  };
}

/**
 * AES-256-GCM Authenticated Decryption
 */
export async function decryptAESGCM(
  ciphertextHex: string,
  ivHex: string,
  keyBytes: Uint8Array
): Promise<string> {
  const iv = hexToBytes(ivHex);
  const encryptedBytes = hexToBytes(ciphertextHex);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    cryptoKey,
    encryptedBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export function getBenchmarkComparisonData() {
  return [
    {
      algorithm: 'RSA-2048',
      category: 'Classical RSA' as const,
      publicKeySize: 256,
      privateKeySize: 1184,
      ciphertextOverhead: 256,
      handshakeTimeMs: 14.2,
      quantumSecurityBits: 0,
      classicalSecurityBits: 112,
      nistStatus: 'Deprecating' as const,
      shorVulnerable: true
    },
    {
      algorithm: 'RSA-4096',
      category: 'Classical RSA' as const,
      publicKeySize: 512,
      privateKeySize: 2352,
      ciphertextOverhead: 512,
      handshakeTimeMs: 92.5,
      quantumSecurityBits: 0,
      classicalSecurityBits: 128,
      nistStatus: 'Deprecating' as const,
      shorVulnerable: true
    },
    {
      algorithm: 'ECDH Secp256r1',
      category: 'Classical ECC' as const,
      publicKeySize: 64,
      privateKeySize: 32,
      ciphertextOverhead: 64,
      handshakeTimeMs: 0.8,
      quantumSecurityBits: 0,
      classicalSecurityBits: 128,
      nistStatus: 'Disallowed Post-2030' as const,
      shorVulnerable: true
    },
    {
      algorithm: 'X25519 (Curve25519)',
      category: 'Classical ECC' as const,
      publicKeySize: 32,
      privateKeySize: 32,
      ciphertextOverhead: 32,
      handshakeTimeMs: 0.4,
      quantumSecurityBits: 0,
      classicalSecurityBits: 128,
      nistStatus: 'Disallowed Post-2030' as const,
      shorVulnerable: true
    },
    {
      algorithm: 'ML-KEM-768 (Kyber)',
      category: 'NIST PQC' as const,
      publicKeySize: 1184,
      privateKeySize: 2400,
      ciphertextOverhead: 1088,
      handshakeTimeMs: 1.1,
      quantumSecurityBits: 192,
      classicalSecurityBits: 192,
      nistStatus: 'NIST Standard (FIPS 203)' as const,
      shorVulnerable: false
    },
    {
      algorithm: 'X25519 + ML-KEM-768 Hybrid',
      category: 'Hybrid PQC' as const,
      publicKeySize: 1216,
      privateKeySize: 2432,
      ciphertextOverhead: 1120,
      handshakeTimeMs: 1.5,
      quantumSecurityBits: 192,
      classicalSecurityBits: 256,
      nistStatus: 'Recommended Hybrid' as const,
      shorVulnerable: false
    }
  ];
}
