const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    text: String,
    type: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    isRemoved: {
        type: Boolean,
        default: false,
    },
    messageId: Number,
    updateId: {
        type: String,
        unique: true,
    },
})

const Update = mongoose.model('Update', updateSchema);

async function createUpdate({ text, type, messageId, updateId }) {
    
    const message = text.replace(/^(\/update\s*)|^[•\s]+/g, '').trim();
    try {
        const newUpdate = await Update.create({ text: message, type, messageId, updateId });
        console.log(`🆕 Created update: "${message}" with messageId: ${messageId}`);
        return newUpdate;
    } catch (err) {
        console.error('❌ Failed to create update:', err.message);
        throw err;
    }
}

async function getUpdatesByDate() {
    try {
        const updates = await Update.find({ seen: false }).sort({ createdAt: -1 });
        return updates;
    } catch (err) {
        console.error('❌ Failed to fetch updates:', err.message);
        throw err;
    }
}

async function toggleUpdateStatus(message, [seen = false,remove = false]) {
    try {
        message = message.replace(/^[•\s]+|👁+/g, '').trim();

        const update = await Update.findOne({ text: message });

        if (!update) {
            console.error('❌ Update not found for message:',`'${message}'`);
            return null;
        }

        if (seen) {
            update.seen = true;
        }

        if (remove) {
            update.isRemoved = true;
        }

        await update.save();
        console.log(`✅ Update status toggled: seen=${update.seen}, removed=${update.isRemoved}`);
        return update;
    } catch (err) {
        console.error('❌ Failed to toggle update status:', err.message);
        throw err;
    }
}

module.exports = {
    createUpdate,
    getUpdatesByDate,
    toggleUpdateStatus,
};