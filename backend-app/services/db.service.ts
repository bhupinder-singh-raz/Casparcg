import { MongoClient, Db, MongoClientOptions } from "mongodb";
import ConstantsService from "./constants.service";
import LoggerService from "./logger.service";

export default class DBService {
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  /**
   * Connect to the MongoDB instance and return the database object
   */
  public static async connectToDB(): Promise<Db> {
    if (!ConstantsService.MONGODB_URL || !ConstantsService.MONGODB_DATABASE_NAME) {
      throw new Error("Database configuration is missing. Please check environment variables.");
    }

    if (!this.client) {
      const url: string = ConstantsService.MONGODB_URL;
      const options: MongoClientOptions = {
        auth: {
          username: ConstantsService.MONGODB_USER as string,
          password: ConstantsService.MONGODB_PASS as string,
        },
        connectTimeoutMS: 10000,
      };

      this.client = new MongoClient(url, options);

      this.client.on("close", () => {
        LoggerService.logError("MongoDB connection closed unexpectedly.");
      });

      this.client.on("error", (error) => {
        LoggerService.logError(`MongoDB connection error: ${error.message}`);
      });

      this.client.on("reconnect", () => {
        LoggerService.logInfo("MongoDB connection reestablished.");
      });

      // Attempt to connect
      try {
        await this.client.connect();
        LoggerService.logInfo(`MongoDB connected`);
        this.db = this.client.db(ConstantsService.MONGODB_DATABASE_NAME);
      } catch (error) {
        LoggerService.logError(`Failed to connect to MongoDB: ${error}`);
        throw error;
      }
    }

    return this.db!;
  }

  /**
   * Close the MongoDB connection
   */
  public static async closeConnection(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        LoggerService.logInfo("MongoDB connection closed successfully.");
      } catch (error) {
        LoggerService.logError(`Error closing MongoDB connection: ${error}`);
      } finally {
        this.client = null;
        this.db = null;
      }
    }
  }

  /**
   * Get the existing MongoDB client or throw an error if not connected
   */
  public static getClient(): MongoClient {
    if (!this.client) {
      throw new Error("MongoDB client is not initialized. Call connectToDB() first.");
    }
    return this.client;
  }

  /**
   * Get the database instance
   */
  public static getDb(): Db {
    if (!this.db) {
      throw new Error("Database is not connected. Call connectToDB() first.");
    }
    return this.db;
  }
}
