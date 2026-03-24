
const MYSQL_CFG = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "health_registry",
};

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
const MONGO_DB = process.env.MONGO_DB || "health_registry";

module.exports = { MYSQL_CFG, MONGO_URI, MONGO_DB };
