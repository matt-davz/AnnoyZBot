const ora = require('ora');
const update = require('./update');

function formatUpdateMessage (text, type, timeStamp){
    const recentEmoji = '🆕';

    const isRecent = timeStamp && Date.now() - new Date(timeStamp).getTime() <= 48 * 60 * 60 * 1000;

    return `• ${isRecent ? ' ' + recentEmoji : ''} \n${text}`;
}

function sortUpdates(updates) {
    return updates.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Sort in descending order
    });
}

async function updateRapidFire(bot,chatId,updates, delay = 500) {
    const spinner = ora('Update Rapid fire in progress...').start();
    try {
        for (const update of updates) {
            const seenInline = [
                { text: 'Remove', callback_data: 'update_seen_remove' }
            ]

            const notSeenInline = [
                { text: 'Seen', callback_data: 'update_seen' },
                { text: 'Seen & Remove', callback_data: 'update_remove' }
            ]


            if (update.isRemoved) continue;
            const body = update.text;
            let formatted = formatUpdateMessage(body, update.type, update.createdAt);

            if(update.seen){
                formatted += '\n\n👁️👁️';
            }

            await bot.sendMessage(chatId, formatted.trim(), {
                reply_markup: {
                    inline_keyboard: [
                        update.seen ? seenInline : notSeenInline,
                    ]
                }
            });
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    catch (err) {
        console.error('❌ Failed to send updates:', err.message);
    } finally {
        spinner.stop();
    }
    return;
}

module.exports = {
    formatUpdateMessage,
    sortUpdates,
    updateRapidFire,
}