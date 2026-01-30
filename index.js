const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable', // Jalur wajib di Railway
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
        ],
    }
});


// Ganti nomor ini dengan nomor bot Anda (gunakan format internasional tanpa + atau spasi)
// Contoh: 628123456789
const phoneNumber = "6289529328975"; 

client.on('qr', async (qr) => {
    // Pastikan nomor HP diawali kode negara (62...) tanpa spasi atau '+'
    const myNumber = "6289529328975"; 
    
    console.log('Sistem sedang meminta Pairing Code untuk:', myNumber);

    try {
        // Beri sedikit jeda agar internal client siap
        setTimeout(async () => {
            const code = await client.getPairingCode(myNumber);
            console.log('======================================');
            console.log('KODE PAIRING ANDA:', code);
            console.log('======================================');
        }, 5000);
    } catch (err) {
        console.error('Gagal mendapatkan Pairing Code:', err);
    }
});

client.on('ready', () => {
    console.log('Nexa Vyne System: Online and Ready.');
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const userMessage = msg.body.toLowerCase();

    if (userMessage.includes('halo') || userMessage.includes('start')) {
        chat.sendStateTyping();
        
        setTimeout(() => {
            client.sendMessage(msg.from, 
                `[SYSTEM INITIALIZING...]\n\n` +
                `▮▮▮▮▮▮▮▮▯▯ 80%\n` +
                `**Nexa Vyne Core** is establishing connection...\n\n` +
                `*Secure link encrypted.* 🔐`
            );
        }, 1000);

        setTimeout(() => {
            client.sendMessage(msg.from, 
                `**Greetings, User.**\n\n` +
                `Saya adalah **Nexa Vyne**, asisten virtual cerdas Anda.\n\n` +
                `📑 **Menu Utama:**\n` +
                `1. 🌐 **Layanan Digital**\n` +
                `2. ⚡ **Optimasi Bisnis**\n` +
                `3. 📞 **Hubungi Tim Ahli**\n\n` +
                `*Ketik angka untuk eksplorasi lebih lanjut.*`
            );
        }, 3000);
    }

    if (msg.body === '1') {
        msg.reply('📂 **[Nexa Vyne Analysis]**\n\nKami melayani pembuatan Web Solution dan Mobile Apps.');
    }
});

client.initialize();

