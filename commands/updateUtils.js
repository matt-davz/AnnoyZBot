function formatUpdateMessage (text, type, timeStamp){
    const recentEmoji = '🆕';

    const isRecent = timeStamp && Date.now() - new Date(timeStamp).getTime() <= 48 * 60 * 60 * 1000;

    return `• ${isRecent ? ' ' + recentEmoji : ''} \n${text}`;
}

module.exports = {
    formatUpdateMessage,
}