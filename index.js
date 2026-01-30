const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Penting untuk Railway
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Nexa Vyne: Scan QR Code di atas untuk login.');
});

client.on('ready', () => {
    console.log('Nexa Vyne System: Online and Ready.');
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const userMessage = msg.body.toLowerCase();

    // Trigger Kata Kunci atau Sapaan
    if (userMessage.includes('halo') || userMessage.includes('start') || userMessage.includes('p')) {
        
        // Efek Mengetik
        chat.sendStateTyping();

        // Pesan 1: Initializing
        setTimeout(() => {
            client.sendMessage(msg.from, 
                `[SYSTEM INITIALIZING...]\n\n` +
                `▮▮▮▮▮▮▮▮▯▯ 80%\n` +
                `**Nexa Vyne Core** is establishing connection...\n\n` +
                `*Secure link encrypted.* 🔐`
            );
        }, 1000);

        // Pesan 2: Main Menu
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

    // Response Menu 1
    if (msg.body === '1') {
        msg.reply('📂 **[Nexa Vyne Analysis]**\n\nKami melayani pembuatan Web Solution, Mobile Apps, dan System Integration. Ingin melihat portfolio? Ketik *PORTFOLIO*.');
    }
});

client.initialize();
                
