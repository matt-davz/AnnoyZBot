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

module.exports = {
    formatUpdateMessage,
    sortUpdates
}