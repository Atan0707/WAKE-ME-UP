const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    authStrategy: new LocalAuth(),
});

// Track if message was already sent today
let messageSentToday = false;
let isClientReady = false;

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log(process.env.TEST);
    console.log('\n=== QR CODE FOR WHATSAPP ===');
    console.log('Scan the QR code below with your phone:');
    qrcode.generate(qr, { small: true });
    console.log('===========================\n');
});

client.on('ready', () => {
    console.log('Client is ready!');
    isClientReady = true;
    // Start the time checker only once when client is ready
    startTimeChecker();
});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

function checkTimeAndSendMessage() {
    if (!isClientReady) {
        return; // Client not ready yet
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.toDateString(); // Get current date as string

    // Check if it's 1:00 PM (13:00) and message hasn't been sent today
    if (currentHour === 13 && currentMinute === 0 && !messageSentToday) {
        sendDailyMessage();
        messageSentToday = true;
        console.log(`Message sent for ${currentDay}`);
    }

    // Reset message sent today at midnight
    if (currentHour === 0 && currentMinute === 0 && messageSentToday) {
        messageSentToday = false;
        console.log('Reset message sent today');
    }
}

async function sendDailyMessage() {
    try {
        const chatId = `${process.env.NUMBER}@c.us`; // WhatsApp chat ID format
        await client.sendMessage(chatId, process.env.MESSAGE);
        console.log('Daily message sent successfully!');
    } catch (error) {
        console.error('Error sending daily message:', error);
        messageSentToday = false;
    }
}

function startTimeChecker() {
    console.log('Starting time checker...');
    
    // Check immediately when starting
    checkTimeAndSendMessage();
    
    // Then check every minute
    setInterval(() => {
        checkTimeAndSendMessage();
    }, 60000); // Check every 60 seconds (1 minute)
    
    console.log('Time checker started - will check every minute for 1:00 PM');
}

client.initialize();