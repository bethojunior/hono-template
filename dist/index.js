"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const blog_created_consumer_1 = require("./app/consumers/blog-created.consumer");
const user_created_consumer_1 = require("./app/consumers/user-created.consumer");
const event_bus_consumer_1 = require("./app/providers/event-bus/event-bus.consumer");
const event_bus_provider_1 = require("./app/providers/event-bus/event-bus.provider");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const resource_routes_1 = __importDefault(require("./routes/resource.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const app = new hono_1.Hono();
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
app.route('/auth', auth_routes_1.default);
app.route('/user', users_routes_1.default);
app.route('/resource', resource_routes_1.default);
app.route('/blog', blog_routes_1.default);
async function bootstrapEventBus() {
    const eventBusProvider = tsyringe_1.container.resolve(event_bus_provider_1.EventBusProvider);
    await eventBusProvider.connect();
    const eventBusConsumer = tsyringe_1.container.resolve(event_bus_consumer_1.EventBusConsumer);
    eventBusConsumer.register(tsyringe_1.container.resolve(blog_created_consumer_1.BlogCreatedConsumer));
    eventBusConsumer.register(tsyringe_1.container.resolve(user_created_consumer_1.UserCreatedConsumer));
    await eventBusConsumer.start();
}
bootstrapEventBus().catch((error) => {
    console.error('❌ Falha ao iniciar o EventBus', error);
});
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
