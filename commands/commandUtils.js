/**
 * Sorts an array of tasks.
 * - Urgent tasks (urgent === true) come first.
 * - Within urgent tasks, sort by priority (0: red, 1: orange, 2: green).
 * - Non-urgent tasks follow, sorted by priority.
 *
 * @param {Array} tasks - Array of task objects to sort.
 * @returns {Array} - Sorted array of tasks.
 */
function sortTasks(tasks) {
    return tasks.sort((a, b) => {
        // Sort by urgency first (urgent === true comes first)
        if (a.urgent !== b.urgent) {
            return b.urgent - a.urgent;
        }
        // If both are urgent or both are not, sort by priority
        return a.priority - b.priority;
    });
}

function sortUpdates(updates) {
    
}

module.exports = { sortTasks };