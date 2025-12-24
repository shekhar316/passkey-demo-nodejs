const express = require('express');
const { 
    generateRegistrationOptions, 
    verifyRegistrationResponse, 
    generateAuthenticationOptions, 
    verifyAuthenticationResponse 
} = require('@simplewebauthn/server');

const { 
    isoUint8Array, 
    isoBase64URL 
} = require('@simplewebauthn/server/helpers');

// creating express app
const app = express();
app.use(express.json());

// use the original domain, as passkeys will verify the server identity
const rpID = '192.168.0.121';
const origin = `http://${rpID}:3000`;

// in-memory database
let users = {}; 
let challenges = {}; 

// register endpoint
app.post('/register/start', async (req, res) => {
    const { username } = req.body;
    const options = await generateRegistrationOptions({
        rpName: 'Passkey Demo',
        rpID,
        userID: isoUint8Array.fromUTF8String(username),
        userName: username,
        authenticatorSelection: {
            residentKey: 'required', 
            requireResidentKey: true,
            userVerification: 'preferred',
        },
    });
    challenges[username] = options.challenge;
    res.json(options);
});

// save the passkey
app.post('/register/finish', async (req, res) => {
    const { username, credential } = req.body;
    try {
        const verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge: challenges[username],
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

            users[username] = {
                devices: [{
                    credentialID: isoBase64URL.fromBuffer(credentialID),
                    credentialPublicKey: isoBase64URL.fromBuffer(credentialPublicKey),
                    counter,
                }]
            };
            res.json({ success: true });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// login endpoint
app.post('/login/start', async (req, res) => {
    const { username } = req.body;
    const user = users[username];
    
    console.log(`Searching for user: ${username}`);
    console.log(`Devices found:`, user ? user.devices.length : 0);

    if (!user || user.devices.length === 0) {
        return res.status(404).json({ error: 'User has no registered passkeys on this server.' });
    }

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: user.devices.map(dev => ({
            id: dev.credentialID,
            type: 'public-key',
        })),
        userVerification: 'preferred',
    });

    res.json(options);
});

// login verification
app.post('/login/finish', async (req, res) => {
    const { username, credential } = req.body;
    const user = users[username];
    const device = user.devices[0];

    try {
        const verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge: challenges[username],
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: isoBase64URL.toBuffer(device.credentialID),
                credentialPublicKey: isoBase64URL.toBuffer(device.credentialPublicKey),
                counter: device.counter,
            },
        });

        if (verification.verified) {
            device.counter = verification.authenticationInfo.newCounter;
            res.json({ success: true });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

app.use(express.static('public'));
app.listen(3000, () => console.log('🚀 Server running: http://localhost:3000'));