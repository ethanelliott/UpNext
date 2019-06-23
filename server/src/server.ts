import errorHandler from "errorhandler";
import logger from './util/logger';
import app from "./app";

// Only in DEV
app.use(errorHandler());


const profiler = logger.startTimer();
logger.info("[SERVER] Setup Server...");
const server = app.listen(app.get("port"), () => {
    logger.info(`[SERVER] Listening on port ${app.get('port')}`);
    logger.info("[SOCKET] Setup SocketIO...");
    // io.on('connection', socket_connection_callback)
    logger.info("[SOCKET] Socketio setup complete");
    // upnext.startPartyEventLoop()
    logger.info(`[SERVER] Server setup complete`);
    profiler.done({message: `[SERVER] Startup`});
});
export default server;
