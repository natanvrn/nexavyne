const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable',
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote'
        ],
    }
});

// GANTI DENGAN NOMOR BOT KAMU (KODE NEGARA TANPA +)
const phoneNumber = "6289529328975"; 

client.on('qr', async (qr) => {
    console.log('Sistem mendeteksi permintaan pairing...');
    try {
        // Jeda agar browser stabil sebelum meminta kode
        setTimeout(async () => {
            const pairingCode = await client.getPairingCode(phoneNumber);
            console.log('======================================');
            console.log('KODE PAIRING ANDA:', pairingCode);
            console.log('======================================');
        }, 5000);
    } catch (err) {
        console.error('Gagal mendapatkan Pairing Code:', err);
    }
});

client.on('ready', () => {
    console.log('Nexa Vyne: Sistem Online.');
});

// Script pembuka canggih Anda
client.on('message', async (msg) => {
    if (msg.body.toLowerCase() === 'halo') {
        msg.reply('[Nexa Vyne Initializing...]\nKoneksi terenkripsi dibangun. Selamat datang.');
    }
});

client.initialize();

