'use strict';

// Load modules

const Boom = require('boom');
const Hapi = require('hapi');
const Joi = require('joi');


// Declare internals

const internals = {
    schema: {
        key: Joi.string().min(1).max(250),
        ttl: Joi.number().min(100).max(60 * 60 * 1000).default(60 * 1000)
    }
};


exports.server = function () {

    const server = Hapi.server({
        routes: {
            response: {
                emptyStatusCode: 204
            }
        }
    });

    server.app.cache = server.cache({ segment: 'data' });

    server.route({ method: 'PUT', path: '/{key}', config: internals.put });
    server.route({ method: 'GET', path: '/{key}', config: internals.get });
    server.route({ method: 'DELETE', path: '/{key}', config: internals.delete });

    return server;
};


internals.put = {
    validate: {
        params: {
            key: internals.schema.key
        },
        query: {
            ttl: internals.schema.ttl
        }
    },
    handler: async (request, h) => {

        const cache = request.server.app.cache;

        await cache.set(request.params.key, request.payload, request.query.ttl);
        return h.response().created(`/${request.params.key}`);
    }
};


internals.get = {
    validate: {
        params: {
            key: internals.schema.key
        }
    },
    handler: async (request, h) => {

        const cache = request.server.app.cache;

        const value = await cache.get(request.params.key);
        if (value === null) {
            throw Boom.notFound();
        }

        return value;
    }
};


internals.delete = {
    validate: {
        params: {
            key: internals.schema.key
        }
    },
    handler: async (request, h) => {

        const cache = request.server.app.cache;

        await cache.drop(request.params.key);
        return null;
    }
};
