const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@adiwajshing/baileys");
const pino = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Kita akan pakai Pairing Code
        logger: pino({ level: "silent" }),
    });

    // NOMOR BOT KAMU
    const phoneNumber = "6289529328975"; 

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            console.log('======================================');
            console.log('KODE PAIRING NEXA VYNE:', code);
            console.log('======================================');
        }, 5000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text && text.toLowerCase() === "halo") {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: "[SYSTEM INITIALIZING...]\n\nNexa Vyne Core Online. Koneksi aman terjalin. 🔐" 
            });
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("Nexa Vyne: Terhubung dengan sukses!");
        }
    });
}

startBot();

