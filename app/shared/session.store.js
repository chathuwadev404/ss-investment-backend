module.exports = {
    MAX_SESSIONS: 100,
    ADMIN_SESSIONS: {},
    ADMIN_USER_SESSIONS: {},
    ADMIN_SESSIONS_IDs: [],

    addAdminSession(sessionId, admin) {
        const existingSessionId = this.ADMIN_USER_SESSIONS[admin.userName];
        if (existingSessionId) {
            this.removeAdminSession(existingSessionId)
        }
        if (this.ADMIN_SESSIONS_IDs.length >= this.MAX_SESSIONS) {
            this.removeAdminSession(this.ADMIN_SESSIONS_IDs[0]);
        }
        this.ADMIN_SESSIONS[sessionId] = admin;
        this.ADMIN_USER_SESSIONS[admin.userName] = sessionId;
        this.ADMIN_SESSIONS_IDs.push(sessionId);
    },

    removeAdminSession(sessionId) {
        let userName = this.ADMIN_SESSIONS[sessionId].userName;
        delete this.ADMIN_SESSIONS[sessionId];
        delete this.ADMIN_USER_SESSIONS[userName];
        this.ADMIN_SESSIONS_IDs.splice(this.ADMIN_SESSIONS_IDs.indexOf(sessionId), 1);
    },

    getAdminSession(sessionId) {
        return this.ADMIN_SESSIONS[sessionId];
    }
};