const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let serviceAccount;

// Check if service account is provided via environment variable (recommended for production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing service account from environment variable:', error);
    process.exit(1);
  }
} 
// Otherwise look for a service account file (development only)
else {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                             path.join(__dirname, '../serviceAccountKey.json');
  
  try {
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    } else {
      console.error(`Service account file not found at ${serviceAccountPath}`);
      console.error('Set GOOGLE_APPLICATION_CREDENTIALS env var or provide a serviceAccountKey.json file');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error loading service account file:', error);
    process.exit(1);
  }
}

// Initialize the app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
});

module.exports = { admin }; 