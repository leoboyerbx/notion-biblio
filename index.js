require('dotenv-flow').config();
const fastify = require("fastify")();

fastify.register(require("@fastify/view"), {
    engine: {
        handlebars: require("handlebars"),
    },
});

fastify.get("/", (req, reply) => {
    reply.view("/views/biblio.hbs", { text: "text" });
});

fastify.listen({ port: 3000 }, (err) => {
    if (err) throw err;
    console.log(`server listening on ${fastify.server.address().port}`);
});
