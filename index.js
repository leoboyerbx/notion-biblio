const {getNotionBiblio} = require('./src/notion')
require('dotenv-flow').config();
const fastify = require("fastify")();

fastify.register(require("@fastify/view"), {
    engine: {
        handlebars: require("handlebars"),
    },
});

fastify.get("/", async (req, reply) => {
    const biblio = await getNotionBiblio(!!+req.query.refresh)
    return reply.view("/views/biblio.hbs", {biblio});
});

fastify.listen({ port: 3000 }, (err) => {
    if (err) throw err;
    console.log(`server listening on ${fastify.server.address().port}`);
});
