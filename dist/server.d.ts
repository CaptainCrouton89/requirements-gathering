import { Application } from "express";
declare const app: Application;
/**
 * Start the Express server
 */
export declare function startServer(port: number): Promise<void>;
export default app;
