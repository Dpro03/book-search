const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const { authMiddleware } = require("./utils/auth");

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require("./schemas");

const db = require("./config/connection");
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

startApolloServer(typeDefs, resolvers);
