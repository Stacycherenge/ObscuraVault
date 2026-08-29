
function textEncode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}


function textDecode(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}


function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}


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

  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer as BufferSource, 
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer as BufferSource, 
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    512 
  );

  const masterKeyBits = derivedBits.slice(0, 32);  
  const authPasswordBits = derivedBits.slice(32, 64); 

  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    masterKeyBits,
    { name: "AES-GCM", length: 256 },
    false, 
    ["encrypt", "decrypt"]
  );

  const authPasswordHex = bufToHex(authPasswordBits);

  return { masterKey, authPasswordHex };
}


export async function encryptSecret(plaintext: string, masterKey: CryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedPlaintext = textEncode(plaintext);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource, 
    },
    masterKey,
    encodedPlaintext as BufferSource 
  );

  return {
    ciphertext: bufToHex(ciphertextBuffer),
    iv: bufToHex(iv.buffer),
  };
}


export async function decryptSecret(ciphertextHex: string, ivHex: string, masterKey: CryptoKey): Promise<string> {
  const ciphertext = hexToBuf(ciphertextHex);
  const iv = hexToBuf(ivHex);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource, 
      },
      masterKey,
      ciphertext as BufferSource 
    );

    return textDecode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed. Threat boundary alert: Modified data or faulty key block.", error);
    throw new Error("Failed to decrypt secure vault payload.");
  }
}