import DBService from "../services/db.service";
import LoggerService from "../services/logger.service";

export async function initializeDB() {
    try {
        await DBService.connectToDB();
    } catch (err) {
        LoggerService.logError(`Database connection error: ${err}`);
        process.exit(1);
    }
}
