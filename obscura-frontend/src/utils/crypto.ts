// src/utils/crypto.ts

/**
 * Converts a plaintext string into a byte array buffer (Uint8Array).
 * Web Crypto API functions strictly require raw binary buffers rather than standard strings.
 */
function textEncode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts a raw binary ArrayBuffer back into a human-readable text string.
 */
function textDecode(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Converts a raw byte array buffer into a hexadecimal string.
 * This makes it safe to transmit over JSON API endpoints and store in PostgreSQL.
 */
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a stored hexadecimal string back into a binary Uint8Array.
 * This prepares the encrypted database payload for the browser's decryption engine.
 */
function hexToBuf(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

/**
 * Derives the Master Key (Km) and Auth Password (Pa) using PBKDF2 with SHA-256.
 * No password stripping or trimming occurs; white spaces are perfectly preserved.
 * 
 * @param password The raw Master Password entered by the user in the login/signup form.
 * @param email The user's email address, which serves as a unique cryptographic salt.
 */
export async function deriveKeys(password: string, email: string) {
  const passwordBuffer = textEncode(password);
  const saltBuffer = textEncode(email);

  // 1. Import the raw password string as raw cryptographic material
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer as BufferSource, // Fixed compilation error with type cast
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );

  // 2. Perform 100,000 hashing loops to stretch the password and eliminate brute-force risks
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer as BufferSource, // Fixed compilation error with type cast
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    512 // Generate a 512-bit block total (64 bytes)
  );

  // 3. Split the 64-byte sequence cleanly in half (32 bytes = 256 bits each)
  const masterKeyBits = derivedBits.slice(0, 32);   // First 256 bits (For encryption)
  const authPasswordBits = derivedBits.slice(32, 64); // Second 256 bits (For server auth)

  // 4. Convert the first half into a live, active AES-GCM CryptoKey instance
  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    masterKeyBits,
    { name: "AES-GCM", length: 256 },
    false, // SECURE BY DESIGN: Marked as non-exportable so JavaScript extensions cannot read it from RAM
    ["encrypt", "decrypt"]
  );

  // 5. Convert the second half into a hexadecimal string to send to FastAPI
  const authPasswordHex = bufToHex(authPasswordBits);

  return { masterKey, authPasswordHex };
}

/**
 * Encrypts an individual secret string (like a username or password) locally using AES-GCM 256-bit.
 * Automatically handles secure initialization vector generation to block cryptographic patterns.
 */
export async function encryptSecret(plaintext: string, masterKey: CryptoKey) {
  // Generate a cryptographically random, unique 12-byte Initialization Vector (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedPlaintext = textEncode(plaintext);

  // Execute AES-GCM encryption loop
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource, // Added cast to guarantee compatibility
    },
    masterKey,
    encodedPlaintext as BufferSource // <--- Add 'as BufferSource' here to fix the error!
  );

  return {
    ciphertext: bufToHex(ciphertextBuffer),
    iv: bufToHex(iv.buffer),
  };
}

/**
 * Decrypts a hex ciphertext block back into a readable string using the Master Key and IV.
 */
export async function decryptSecret(ciphertextHex: string, ivHex: string, masterKey: CryptoKey): Promise<string> {
  const ciphertext = hexToBuf(ciphertextHex);
  const iv = hexToBuf(ivHex);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource, // Added cast for safety
      },
      masterKey,
      ciphertext as BufferSource // Added cast for safety
    );

    return textDecode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed. Threat boundary alert: Modified data or faulty key block.", error);
    throw new Error("Failed to decrypt secure vault payload.");
  }
}