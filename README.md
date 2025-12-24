# 🔑 Simple Passkey Demo (WebAuthn)

A lightweight, end-to-end implementation of Passkeys (WebAuthn) using Node.js and the @simplewebauthn library. 
This project demonstrates how to register a biometric credential and use it for a passwordless login.

## 🌟 Features
- **Passwordless Registration:** Create a passkey using TouchID, FaceID, or a mobile device.
- **Biometric Authentication:** Log in securely without typing a single character.
- **Modern Security:** Uses public-key cryptography (ES256) to ensure credentials never leave the user's device.

## 🛠️ Technology Stack
- **Backend:** Node.js, Express
- **Library:** @simplewebauthn/server
- **Frontend:** Vanilla JavaScript + SimpleWebAuthn Browser SDK

## 🚀 Getting Started

#### 1. Prerequisites
- Node.js (v16 or higher)
- A device with biometric support (MacBook with TouchID, Android/iPhone, or Windows Hello)

#### 2. Installation
```
Bash

# Clone the repository
git clone https://github.com/your-username/passkey-demo.git

# Navigate into the project
cd passkey-demo

# Install dependencies
npm install

# Run the Server
node app.js
# The demo will be live at http://localhost:3000

# Change the rpID to your domain before running the demo
```

## 🧪 Testing the Flow
- **Register**: Enter an email and click "Create Passkey". Your browser/OS will prompt you for a fingerprint or face scan.
- **Login**: Enter the same email and click "Login with Passkey". Confirm the biometric prompt to complete the handshake.

## ⚠️ Important: The "Localhost Struggle"
You might notice that while Registration works smoothly, Login can sometimes say "No passkeys available." This is not a bug; it is Passkey security in action.
- Domain Binding (RP ID): Every passkey is cryptographically locked to a domain. A passkey created for localhost is invisible to an IP address (192.168...). If your browser URL doesn't match your rpID precisely, the phone stays silent to prevent phishing.
- Secure Context (HTTPS): WebAuthn requires HTTPS. While browsers make an exception for localhost, they are much stricter when using a mobile phone as an external authenticator over a local network.
- In-Memory DB: This demo uses an in-memory variable to store users. If you restart the server, the "lock" is deleted. Your phone will still have the "key," but the server will no longer recognize it.

In a production environment with a dedicated domain (HTTPS) and a persistent database (PostgreSQL/MongoDB), these issues should disappear, and the login should be a seamless "one-tap" experience.
