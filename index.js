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

    const sender = m.key.remoteJid;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const isOwner = sender === ownerNumber;

    // --- TRIGGER PEMBUKA MODERN ---
    if (body.toLowerCase() === "halo" || body.toLowerCase() === "p" || body.toLowerCase() === "start") {
        
        // 1. Status Typing
        await sock.sendPresenceUpdate('composing', sender);

        // 2. Efek Loading (Pesan Pertama)
        await sock.sendMessage(sender, { 
            text: "```NEXA VYNE v1.0.4 - BOOTING...```\n" +
                  "📡 `Connecting to neural_network...`"
        });

        await delay(1500);

        // 3. Status Progress (Pesan Kedua - Update Visual)
        await sock.sendMessage(sender, { 
            text: "💠 **Core System:** `ONLINE`\n" +
                  "🔐 **Encryption:** `AES-256 ACTIVE`\n" +
                  "▮▮▮▮▮▮▮▮▮▯ `90%`" 
        });

        await delay(1000);

        // 4. Pesan Utama (Main UI)
        const modernWelcome = {
            text: `*GREETINGS, HUMAN* 🌌\n\n` +
                  `Sistem **Nexa Vyne** telah sepenuhnya terinisialisasi. Saya siap menjadi asisten digital Anda.\n\n` +
                  `┌──  *S Y S T E M  M E N U*\n` +
                  `│ 📂 *.menu* - Akses Database\n` +
                  `│ ⚡ *.speed* - Cek Latensi\n` +
                  `│ 👤 *.owner* - Kontak Pengembang\n` +
                  `└───────────────🪐\n\n` +
                  `_Apa yang bisa saya optimasi hari ini?_`,
            contextInfo: {
                externalAdReply: {
                    title: "Nexa Vyne: Adaptive AI",
                    body: "Status: Connection Secured",
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    // Kamu bisa masukkan link gambar logo bot kamu di sini
                    thumbnailUrl: "https://telegra.ph/file/logo-nexa-vyne.jpg", 
                    sourceUrl: "https://github.com/your-repo"
                }
            }
        };

        await sock.sendMessage(sender, modernWelcome);
        await sock.sendPresenceUpdate('paused', sender);
    }
});

        }
    });
}

startBot().catch(err => console.error("Critical Error:", err));

