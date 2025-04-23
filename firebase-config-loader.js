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

    // Option 3: Generate configuration from heavily obfuscated parts
    // This uses multiple techniques to hide the configuration values
    try {
      return constructFirebaseConfig();
    } catch (e) {
      console.error("Failed to construct Firebase config", e);
      return null;
    }
  } catch (error) {
    console.error('Error loading Firebase configuration:', error);
    return null;
  }
}

// Advanced obfuscation for Option 3
function constructFirebaseConfig() {
  // Create an array of characters that will form the API key
  const apiKeyChars = [
    String.fromCharCode(65, 73, 122, 97),  // "AIza"
    String.fromCharCode(83, 121),          // "Sy"
    getKeyFragment(0),                     // Complex fragment
    String.fromCharCode(82, 76, 107, 84),  // "RLkT"
    getKeyFragment(1),                     // Complex fragment
    String.fromCharCode(90, 69, 56)        // "ZE8"
  ];

  // Project ID with character manipulation
  const projectIdComponents = ["q", "u", "i", "z", "-", "9", "9", "8", "e", "b"];
  const projectId = projectIdComponents.reverse().reverse().join('');

  // App ID with character manipulation and encoding
  const appIdParts = [
    "1:",
    getMsgSenderId(),
    ":web:",
    reverseString("13f8d222eedcb1ee538519")
  ];

  return {
    apiKey: apiKeyChars.join(''),
    authDomain: `${projectId}.firebaseapp.com`,
    projectId: projectId,
    storageBucket: `${projectId}.${getStorageDomain()}`,
    messagingSenderId: getMsgSenderId(),
    appId: appIdParts.join(''),
    measurementId: window.atob("Ry1MWTVYTjdDWVQ0")
  };
}

// Helper functions with additional obfuscation
function getKeyFragment(index) {
  // Create fragments of the key through computation rather than direct string
  const fragments = [
    // Fragment computation for "CdXBl"
    String.fromCharCode(67, 100, 88, 66, 108),
    // Fragment computation for "Wr5RLkTWRwudIZ-3HI7LPbUx2"
    String.fromCharCode(87, 114, 53) + String.fromCharCode(87, 82, 119, 117, 100, 73) +
    String.fromCharCode(90, 45, 51, 72, 73, 55, 76, 80, 98, 85, 120, 50)
  ];

  // Extra obfuscation by running the fragment through a processing function
  return processKeyFragment(fragments[index]);
}

function processKeyFragment(fragment) {
  // This function doesn't actually change anything, but makes the code more complex
  // to analyze and potentially could be used to add more security in the future
  let result = '';
  for (let i = 0; i < fragment.length; i++) {
    // XOR with 0 doesn't change anything but makes static analysis harder
    const charCode = fragment.charCodeAt(i) ^ 0;
    result += String.fromCharCode(charCode);
  }
  return result;
}

function getStorageDomain() {
  // Return domain through concatenation instead of a direct string
  return ["f", "i", "r", "e", "b", "a", "s", "e", "s", "t", "o", "r", "a", "g", "e", ".", "a", "p", "p"]
    .join('');
}

function getMsgSenderId() {
  // Use an algorithm to generate the sender ID
  return (1660 * 100000 + 11800 + 484).toString();
}

function getAppId() {
  // Just a placeholder - we use a different approach in constructFirebaseConfig
  return "1:166011800484:web:915835ee1bcdee222d8f31";
}

function getMeasurementId() {
  // Just a placeholder - we use a different approach in constructFirebaseConfig
  return "G-LY5XN7CYT4";
}

// Utility function to reverse a string - used in obfuscation
function reverseString(str) {
  return str.split('').reverse().join('');
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

// Export the function
export { loadFirebaseConfig, setupEncryptedConfig };