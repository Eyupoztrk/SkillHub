const mongoose = require("mongoose");

let instance = null;

class DatabaseManager {

    constructor() {

        if (!instance) {
            instance = this;
        }
        return instance;

    }

    async connect(options)
    {
        let db = await mongoose.connect(options.CONNECTION_STRING);
        console.log("DB CONNECTION SUCCESS")

    }

}

module.exports = DatabaseManager;