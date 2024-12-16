import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/schemas";
import { resolvers } from "./graphql/resolvers";
import ErrorHandler, { ErrorHandlerMiddlewareError } from "./middlewares/errorHandler";
import HTTP_Request_Logger from "./middlewares/httpRequestLogger";
import ConstantsService from "./services/constants.service";
import LoggerService from "./services/logger.service";
import cors from "cors";
import helmet from "helmet";
import { HTTPStatusCode } from "./util/constant";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { initializeDB } from "./util/initializeDB";
import { context } from "./graphql/context";

const app = express();

initializeDB();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(helmet());
app.use(HTTP_Request_Logger());
app.use(
  cors({
    origin: function (origin, callback) {
      if (ConstantsService.WHITELIST.indexOf(origin as string) !== -1) {
        callback(null, true);
      } else {
        LoggerService.logInfo(`Origin ${origin} restricted via CORS`);
        const error: ErrorHandlerMiddlewareError = new Error("Unauthorized");
        error.statusCode = HTTPStatusCode.UNAUTHORIZED;
        error.messageCode = "CORS_ERROR";
        callback(error);
        return;
      }
    },
    credentials: true,
  })
);

// Create an HTTP server
const httpServer = createServer(app);

// GraphQL and WebSocket server setup
(async () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // WebSocket Server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const wsServerCleanup = useServer({ schema, context }, wsServer);

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsServerCleanup.dispose()
            }
          }
        }
      }
    ]
  });

  await apolloServer.start();

  app.use("/graphql", expressMiddleware(apolloServer, { context }));
})();

// Global error handler
app.use(ErrorHandler);

// Start server
httpServer.listen(ConstantsService.PORT, ConstantsService.HOST, () => {
  LoggerService.logInfo(
    `Server running at http://${ConstantsService.HOST}:${ConstantsService.PORT}/`
  );
});