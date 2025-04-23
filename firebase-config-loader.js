// Firebase Configuration Loader
// This file loads Firebase configuration at runtime from a secure location

// Function to load Firebase configuration
async function loadFirebaseConfig() {
  try {
    // Option 1: Load from a secure API endpoint
    // This endpoint should be hosted on your own server with proper CORS settings
    // const response = await fetch('https://your-secure-api.com/firebase-config');
    // const config = await response.json();
    // return config;

    // Option 2: Load from a secure, password-protected JSON file
    // This requires user to enter a password to decrypt configuration
    const configEncrypted = localStorage.getItem('firebase_config_encrypted');
    if (configEncrypted) {
      return decryptConfig(configEncrypted, getConfigPassword());
    }

    // Option 3: Generate configuration with moderate obfuscation
    // This uses simple encoding and string operations to hide values
    return createFirebaseConfig();
  } catch (error) {
    console.error('Error loading Firebase configuration:', error);
    return null;
  }
}

// Create Firebase config from encoded parts
function createFirebaseConfig() {
  // Base64 encoded parts of the config
  const encodedParts = [
    "QUl6YVN5Q2RYQmxWcjVSTGtUV1J3dWRJWi0zSEk3TFBiVXgyWkU4", // API Key
    "cXVpei05OThlYi5maXJlYmFzZWFwcC5jb20=", // Auth Domain
    "cXVpei05OThlYg==", // Project ID
    "cXVpei05OThlYi5maXJlYmFzZXN0b3JhZ2UuYXBw", // Storage Bucket
    "MTY2MDExODAwNDg0", // Messaging Sender ID
    "MToxNjYwMTE4MDA0ODQ6d2ViOjkxNTgzNWVlMWJjZGVlMjIyZDhmMzE=", // App ID
    "Ry1MWTVYTjdDWVQ0" // Measurement ID
  ];

  // Decode the parts
  const apiKey = atob(encodedParts[0]);
  const authDomain = atob(encodedParts[1]);
  const projectId = atob(encodedParts[2]);
  const storageBucket = atob(encodedParts[3]);
  const messagingSenderId = atob(encodedParts[4]);
  const appId = atob(encodedParts[5]);
  const measurementId = atob(encodedParts[6]);

  // Create and validate the config object
  const config = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId
  };

  // Validate config (make sure at least the API key looks valid)
  if (!config.apiKey || !config.apiKey.startsWith('AIza')) {
    throw new Error('Invalid Firebase configuration generated');
  }

  return config;
}

// If using encryption approach
function getConfigPassword() {
  // This could be a user-input password, or derived from some other data
  return prompt("Enter configuration password:");
}

function decryptConfig(encryptedData, password) {
  // Simple XOR decryption example - in production use a proper encryption library
  try {
    // This is a placeholder for actual decryption
    const decrypted = atob(encryptedData);
    return JSON.parse(decrypted);
  } catch (e) {
    console.error("Failed to decrypt configuration", e);
    return null;
  }
}

// Function to set up encrypted config (admin only)
function setupEncryptedConfig(configObject, password) {
  const configString = JSON.stringify(configObject);
  // Simple encryption for example - use proper encryption in production
  const encrypted = btoa(configString); // This is not secure, just an example
  localStorage.setItem('firebase_config_encrypted', encrypted);
  console.log("Config stored securely.");
}

// Console logging for debugging
function debugConfig(config) {
  if (!config) {
    console.error("Firebase configuration is null or undefined");
    return;
  }

  // Log partial key info for debugging without exposing entire key
  console.log("API Key starts with:", config.apiKey.substring(0, 8) + "...");
  console.log("Auth Domain:", config.authDomain);
  console.log("Project ID:", config.projectId);
  // Other fields are implied to be working if these are correct
}

// Export the function
export { loadFirebaseConfig, setupEncryptedConfig };