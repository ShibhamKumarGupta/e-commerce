// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import { Server } from './src/app/main';

// Start the server
const server = new Server();
server.start();

export default server;
