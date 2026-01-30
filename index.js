const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startBot() {
    // 1. Kelola Sesi (Penyimpanan Login)
    const { state, saveCreds } = await useMultiFileAuthState('auth_nexa_vyne');
    
    // 2. Inisialisasi Koneksi
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Kita matikan QR karena pakai Pairing Code
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"] // Identitas bot
    });

    // --- BAGIAN PAIRING CODE ---
    const phoneNumber = "6289529328975"; // <--- MASUKKAN NOMOR DISINI

    if (!sock.authState.creds.registered) {
        console.log(`Menyiapkan permintaan Pairing Code untuk: ${phoneNumber}`);
        await delay(5000); // Jeda 5 detik agar sistem siap
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('======================================');
            console.log('KODE PAIRING NEXA VYNE ANDA:', code);
            console.log('======================================');
        } catch (error) {
            console.error('Gagal mendapatkan pairing code:', error);
        }
    }

    // 3. Event Listener: Simpan Sesi
    sock.ev.on("creds.update", saveCreds);

    // 4. Event Listener: Koneksi (Auto Reconnect)
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Koneksi terputus, mencoba menghubungkan kembali...");
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("Nexa Vyne: BERHASIL TERHUBUNG! 🚀");
        }
    });

    // 5. Logika Bot Pembuka Canggih
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const sender = m.key.remoteJid;

        if (text.toLowerCase() === "halo" || text.toLowerCase() === "start") {
            await sock.sendMessage(sender, { 
                text: "*[SYSTEM INITIALIZING...]*\n\nSelamat datang di **Nexa Vyne Core**.\nKoneksi aman terjalin. Bagaimana saya bisa membantu Anda hari ini? 🔐" 
            });
        }
    });
}

startBot().catch(err => console.error("Critical Error:", err));

