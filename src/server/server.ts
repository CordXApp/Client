import path from "node:path";
import Logger from "../utils/logger.util";
import CordX from "../client/cordx";
import fastify, { FastifyInstance } from "fastify";
import { version } from "../../package.json";

export default class CordXServer {
    private client: CordX;
    public logger: Logger;
    public app: FastifyInstance;

    constructor(client: CordX) {
        this.client = client;
        this.logger = new Logger('API');
        this.app = fastify({
            logger: false
        });
    }

    public async start() {

        this.app.register(require('@fastify/multipart'), {
            addToBody: true
        })

        this.app.register(require('@fastify/cors'), {
            origin: ['*'],
            allowedHeaders: ['secret', 'userid', 'Authorization', 'authorization', 'Content-Type', 'Content-Disposition', 'Content-Length', 'multipart/form-data'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
            optionsSuccessStatus: 200,
            strictPreflight: true,
            preflight: true
        });

        this.app.register(require('@fastify/swagger'), {
            routePrefix: '/docs',
            exposeRoute: true,
            hideUntagged: true,
            swagger: {
                host: 'api.cordx.lol',
                basePath: '/',
                schemes: ['https', 'http'],
                consumes: ['application/json', 'multipart/form-data'],
                produces: ['application/json'],
                info: {
                    title: 'CordX API',
                    description: 'Documentation for the CordX API',
                    version: version
                },
                tags: [
                    { name: 'Auth', description: 'Authentication endpoints' },
                    { name: 'Client', description: 'Client endpoints' },
                    { name: 'System', description: 'System endpoints' },
                    { name: 'Upload', description: 'Upload endpoints' },
                    { name: 'Users', description: 'User endpoints' }
                ]
            },
            uiConf: { docExpansion: 'full', deepLinking: false },
            uiHooks: {
                onRequest: function (req: any, reply: any, next: any) {
                    next();
                },
                preHandler: function (req: any, reply: any, next: any) {
                    next();
                },
            }
        })

        this.app.register(require('@fastify/autoload'), {
            dir: path.join(__dirname, 'routes')
        });

        this.app.addHook("preHandler", (req, res, done) => {
            req.client = this.client;

            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('X-Powered-By', 'Infinity Development <https://infinitydev.team>');
            res.header('User-Agent', `CordX v${version}`);

            done();
        });

        this.app.setNotFoundHandler((req, res) => {
            res.status(404).send({
                message: 'Whoops! The endpoint you are looking for does not exist.',
                code: 404
            });
        })

        this.app.setErrorHandler((error, req, res) => {

            if (error.code === "FST_ERR_CTP_EMPTY_JSON_BODY") return res.status(400).send({
                message: 'Please provide a valid JSON request body!',
                state: 'CORDX:BAD_REQUEST',
                code: 400
            })

            res.status(500).send({
                message: 'An internal server error occurred. Please try again later.',
                error: error.message,
                state: 'CORDX:INTERNAL_SERVER_ERROR',
                code: 500
            })
        });

        this.app.ready(err => {
            if (err) throw err;
            this.app.swagger();
        });

        try {
            this.app.listen({
                port: parseInt('4985'),
                host: '0.0.0.0'
            });

            this.logger.ready(`Server is running on port: 4985`);
        } catch (e: unknown) {
            this.logger.error(`An error occurred while starting the server: ${(e as Error).message}`);
            this.logger.debug(`Stack trace: ${(e as Error).stack}`);
        }
    }
}

declare module "fastify" {
    export interface FastifyInstance {
        swagger: () => void;
    }
}

declare module "fastify" {
    export interface FastifyRequest {
        client: CordX;
    }
}