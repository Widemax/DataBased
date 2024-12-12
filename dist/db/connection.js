"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.connectToDb = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env
dotenv_1.default.config();
// PostgreSQL connection pool configuration
const pool = new pg_1.Pool({
    user: process.env.DB_USER, // Environment variable for username
    host: process.env.DB_HOST, // Environment variable for host
    database: process.env.DB_NAME, // Environment variable for database name
    password: process.env.DB_PASSWORD, // Environment variable for password
    port: Number(process.env.DB_PORT), // Environment variable for port
});
exports.pool = pool;
// Function to connect to the database
const connectToDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        console.log('Connected to the database');
        const res = yield client.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0]);
        client.release();
    }
    catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
});
exports.connectToDb = connectToDb;
