/** *
requirements-gatherer
*
A requirements gathering application that asks clarifying questions to help users build detailed specifications documents
*/ import dotenv from 'dotenv'; import chalk from 'chalk'; import { startServer
} from './server.js'; // Load environment variables from .env file
dotenv.config(); const PORT = process.env.PORT || 3000; async function main() {
try { console.log(chalk.blue('Starting
requirements-gatherer
server...')); await startServer(Number(PORT)); console.log(chalk.green(`Server
is running on port ${PORT}`)); } catch (error) { console.error(chalk.red('Failed
to start server:'), error); process.exit(1); } } main();