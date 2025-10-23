// ftp-upload.js
// Automatically upload updated files to your FTP server
// npm install basic-ftp

const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

// FTP Configuration
const config = {
  host: "your-ftp-server.com",
  user: "your-username",
  password: "your-password",
  secure: false, // Set to true for FTPS
  port: 21 // Default FTP port
};

// Paths
const LOCAL_DIR = path.join(__dirname, '../production-build');
const REMOTE_DIR = "/public_html"; // Remote directory on your FTP server

// Function to upload a directory recursively
async function uploadDirectory() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Set to true for debugging
  
  try {
    console.log("Connecting to FTP server...");
    await client.access(config);
    
    console.log(`Uploading files from ${LOCAL_DIR} to ${REMOTE_DIR}...`);
    await client.uploadFromDir(LOCAL_DIR, REMOTE_DIR);
    
    console.log("Upload completed successfully!");
    return true;
  } catch (err) {
    console.error("Error during FTP upload:", err);
    return false;
  } finally {
    client.close();
  }
}

// Execute the upload
console.log("Starting FTP upload process...");

uploadDirectory()
  .then(success => {
    if (success) {
      console.log("Website successfully updated and uploaded.");
      process.exit(0);
    } else {
      console.log("Website update failed.");
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });