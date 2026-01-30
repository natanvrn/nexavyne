const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_nexa_vyne');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- CONFIGURATION ---
    const ownerNumber = "62895406447990@s.whatsapp.net"; // GANTI NOMOR WA KAMU DISINI
    const phoneNumber = "6289529328975"; // GANTI NOMOR WA BOT DISINI

    // --- PAIRING CODE LOGIC ---
    if (!sock.authState.creds.registered) {
        console.log(`Menyiapkan permintaan Pairing Code untuk: ${phoneNumber}`);
        await delay(5000);
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('======================================');
            console.log('KODE PAIRING NEXA VYNE ANDA:', code);
            console.log('======================================');
        } catch (error) {
            console.error('Gagal mendapatkan pairing code:', error);
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("Nexa Vyne: BERHASIL TERHUBUNG! 🚀");
        }
    });

    // --- MESSAGE HANDLER (PEMBUKA MODERN & FITUR OWNER) ---
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const isOwner = sender === ownerNumber;

        // 1. Trigger Pembukaan Modern
        if (body.toLowerCase() === "halo" || body.toLowerCase() === "p" || body.toLowerCase() === "start") {
            await sock.sendPresenceUpdate('composing', sender);
            await sock.sendMessage(sender, { text: "```NEXA VYNE v1.0.4 - BOOTING...```\n📡 `Connecting to neural_network...`" });
            await delay(1500);
            
            const modernWelcome = {
                text: `*GREETINGS, HUMAN* 🌌\n\n` +
                      `Sistem *Nexa Vyne* telah aktif. Saya siap menjadi asisten digital Anda.\n\n` +
                      `┌──  *S Y S T E M  M E N U*\n` +
                      `│ 📂 *.menu* - Akses Database\n` +
                      `│ ⚡ *.speed* - Cek Latensi\n` +
                      `│ 👤 *.owner* - Kontak Pengembang\n` +
                      `└───────────────🪐\n\n` +
                      `_Apa yang bisa saya bantu hari ini?_`
            };
            await sock.sendMessage(sender, modernWelcome);
        }

        // 2. Fitur Khusus Owner
        if (isOwner) {
            if (body.startsWith(".runtime")) {
                const uptime = process.uptime();
                const h = Math.floor(uptime / 3600);
                const m = Math.floor((uptime % 3600) / 60);
                await sock.sendMessage(sender, { text: `🛡️ *SYSTEM STATUS*\n⏱️ Uptime: ${h}j ${m}m\n🚀 Mode: High Performance` });
            }

            if (body.startsWith(".shutdown")) {
                await sock.sendMessage(sender, { text: "⚠️ *System Offline.*" });
                process.exit();
            }
        }
    }); // <--- Penutup messages.upsert
} // <--- Penutup startBot

startBot().catch(err => console.error("Critical Error:", err));
