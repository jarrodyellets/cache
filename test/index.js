'use strict';

// Load modules

const Code = require('code');
const Hoek = require('hoek');
const Lab = require('lab');

const Cache = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Cache', () => {

    describe('PUT /{key}', () => {

        it('sets a key and returns value', async () => {

            const server = Cache.server();
            await server.initialize();

            const payload = { a: 1 };
            const res1 = await server.inject({ method: 'PUT', url: '/x1', payload });
            expect(res1.statusCode).to.equal(201);
            expect(res1.headers.location).to.equal('/x1');

            const res2 = await server.inject('/x1');
            expect(res2.statusCode).to.equal(200);
            expect(res2.result).to.equal(payload);
        });

        it('sets a key with ttl', async () => {

            const server = Cache.server();
            await server.initialize();

            const payload = { a: 1 };
            const res1 = await server.inject({ method: 'PUT', url: '/x1?ttl=100', payload });
            expect(res1.statusCode).to.equal(201);
            expect(res1.headers.location).to.equal('/x1');

            const res2 = await server.inject('/x1');
            expect(res2.statusCode).to.equal(200);
            expect(res2.result).to.equal(payload);

            await Hoek.wait(100);

            const res3 = await server.inject('/x1');
            expect(res3.statusCode).to.equal(404);
        });
    });

    describe('GET /{key}', () => {

        it('errors on missing key', async () => {

            const server = Cache.server();
            await server.initialize();

            const res = await server.inject('/x1');
            expect(res.statusCode).to.equal(404);
        });
    });

    describe('DELETE /{key}', () => {

        it('deletes a key', async () => {

            const server = Cache.server();
            await server.initialize();

            const payload = { a: 1 };
            const res1 = await server.inject({ method: 'PUT', url: '/x1', payload });
            expect(res1.statusCode).to.equal(201);
            expect(res1.headers.location).to.equal('/x1');

            const res2 = await server.inject('/x1');
            expect(res2.statusCode).to.equal(200);
            expect(res2.result).to.equal(payload);

            const res3 = await server.inject({ method: 'DELETE', url: '/x1' });
            expect(res3.statusCode).to.equal(204);

            const res4 = await server.inject('/x1');
            expect(res4.statusCode).to.equal(404);
        });
    });
});
