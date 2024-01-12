const mongoose = require("mongoose");
const {
  db: { host, name, port },
} = require("../configs/mongodb");

const connectString = `mongodb://${host}:${port}/${name}`;
console.log(`Server will connect to mongodb: ${connectString}`);

class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString)
      .then((_) =>
        console.log(`Connect to mongodb: ${connectString} successfully`)
      )
      .catch((err) =>
        console.log(`Connect to mongodb: ${connectString} failed: ${err}`)
      );
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const mongoDB = Database.getInstance();
module.exports = mongoDB;
