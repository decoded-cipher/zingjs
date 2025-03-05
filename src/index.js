import { createServer } from 'http';
import { EventEmitter } from 'events';
import { readdirSync, existsSync, mkdirSync, writeFileSync, appendFileSync, createReadStream, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOG_FILE = join(process.cwd(), 'logs', 'server.log');
const STATIC_FOLDER = join(process.cwd(), 'public');

class ZingJS {
    constructor({ enableCors = false, enableRateLimit = false, enableLogging = true, serveStatic = false, defaultResponseType = 'json' } = {}) {
        this.server = createServer(this.requestHandler.bind(this));
        this.middlewares = [];
        this.eventBus = new EventEmitter();
        this.routes = {};
        this.enableLogging = enableLogging;
        this.serveStatic = serveStatic;
        this.defaultResponseType = defaultResponseType;
        this.ensureRoutesFolder();
        if (serveStatic) this.ensureStaticFolder();
        if (enableLogging) this.setupLogging();
        this.loadRoutes();
        this.setupDefaultRoutes();
        this.use(this.jsonParserMiddleware);
        if (enableCors) this.use(this.corsMiddleware);
        if (enableRateLimit) this.use(this.rateLimitMiddleware());
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    on(event, listener) {
        this.eventBus.on(event, listener);
    }

    emit(event, data) {
        this.eventBus.emit(event, data);
    }

    ensureRoutesFolder() {
        const routesPath = join(process.cwd(), 'routes');
        if (!existsSync(routesPath)) {
            mkdirSync(routesPath, { recursive: true });
            writeFileSync(join(routesPath, 'index.js'), "export default { GET: (req) => ({ message: 'Hello from ZingJS dynamic route!' }) };\n");
        }
    }

    ensureStaticFolder() {
        if (!existsSync(STATIC_FOLDER)) {
            mkdirSync(STATIC_FOLDER, { recursive: true });
        }
    }

    setupLogging() {
        const logsPath = join(process.cwd(), 'logs');
        if (!existsSync(logsPath)) {
            mkdirSync(logsPath, { recursive: true });
        }
        this.log('[INFO] Logging initialized');
    }

    log(message) {
        if (!this.enableLogging) return;
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(logMessage.trim());
        appendFileSync(LOG_FILE, logMessage);
    }

    loadRoutes() {
        const routesPath = join(process.cwd(), 'routes');
        if (existsSync(routesPath)) {
            const routeFiles = readdirSync(routesPath);
            routeFiles.forEach(file => {
                if (extname(file) === '.js') {
                    const routePath = '/' + basename(file, '.js');
                    import(join(routesPath, file)).then(module => {
                        Object.keys(module.default).forEach(method => {
                            this.routes[`${routePath}:${method}`] = {
                                method,
                                handler: module.default[method]
                            };
                        });
                        this.log(`[INFO] Loaded route: ${routePath}`);
                    }).catch(err => this.log(`[ERROR] Failed to load route ${file}: ${err}`));
                }
            });
        }
    }

    setupDefaultRoutes() {
        this.routes['/:GET'] = { method: 'GET', handler: () => ({ message: 'Welcome to ZingJS!' }) };
        this.routes['/index:GET'] = { method: 'GET', handler: () => ({ message: 'Hello from ZingJS dynamic route!' }) };
    }

    async jsonParserMiddleware(req, res, next) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            req.body = {};
            if (body) {
                try {
                    req.body = JSON.parse(body);
                } catch {
                    req.body = {};
                    this.log('[WARN] Failed to parse JSON body');
                }
            }
            next();
        });
    }

    corsMiddleware(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        next();
    }

    rateLimitMiddleware() {
        const limitMap = new Map();
        return (req, res, next) => {
            const key = req.socket.remoteAddress;
            const now = Date.now();
            const resetTime = now + 15 * 60 * 1000;

            if (!limitMap.has(key)) {
                limitMap.set(key, { count: 1, resetTime });
            } else {
                const entry = limitMap.get(key);
                if (entry.count >= 100) {
                    res.writeHead(429, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Too many requests, please try again later.' }));
                    return;
                }
                entry.count++;
            }
            next();
        };
    }

    async requestHandler(req, res) {
        this.log(`[INFO] ${req.method} ${req.url}`);
        req.query = Object.fromEntries(new URL(req.url, `http://localhost`).searchParams);
        req.params = {};

        if (this.serveStatic && req.method === 'GET') {
            let filePath = join(STATIC_FOLDER, req.url);
            if (existsSync(filePath)) {
                if (statSync(filePath).isDirectory()) {
                    filePath = join(filePath, 'index.html');
                }
                if (existsSync(filePath) && !filePath.includes('..')) {
                    res.writeHead(200);
                    createReadStream(filePath).pipe(res);
                    return;
                }
            }
        }

        let idx = 0;
        const next = async () => {
            if (idx < this.middlewares.length) {
                await this.middlewares[idx++](req, res, next);
            } else {
                this.handleRoute(req, res);
            }
        };
        next();
    }

    handleRoute(req, res) {
        const path = req.url.split('?')[0];
        const method = req.method;
        const routeKey = `${path}:${method}`;
        const route = this.routes[routeKey];
        if (route && typeof route.handler === 'function') {
            const response = route.handler(req);
            if (this.defaultResponseType === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(response));
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.end(String(response));
            }
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not Found' }));
            this.log(`[WARN] ${method} ${path} - 404 Not Found`);
        }
    }

    listen(port, callback) {
        this.server.listen(port, () => {
            this.log(`[INFO] Server running at http://localhost:${port}`);
            if (callback) callback();
        });
    }
}

export default ZingJS;
