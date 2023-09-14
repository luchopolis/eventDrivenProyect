"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
require("reflect-metadata");
var db_1 = require("./db/db");
var product_1 = require("./entity/product");
var category_1 = require("./entity/category");
var amqplib = require("amqplib");
var queues_1 = require("./queues");
// queue rabbit
var queue = 'product';
var exchangeName = 'add_logs';
var app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}));
app.use(express.json());
console.log('Listent to port: 8000');
function initializeChannelsQueues(con) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, queues_1.default)(['add_product', 'request_categories'], con)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function runApp() {
    return __awaiter(this, void 0, void 0, function () {
        var productRepo, categoryRepo, connR, channel_1, e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.initialize()];
                case 1:
                    _a.sent();
                    productRepo = db_1.default.getRepository(product_1.Product);
                    categoryRepo = db_1.default.getRepository(category_1.Category);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, amqplib.connect('amqp://localhost')];
                case 3:
                    connR = _a.sent();
                    return [4 /*yield*/, initializeChannelsQueues(connR)
                        // create a channel
                        //channel = await connR.createChannel()
                        //await channel.assertQueue('add_product', { durable: false })
                    ];
                case 4:
                    channel_1 = _a.sent();
                    // create a channel
                    //channel = await connR.createChannel()
                    //await channel.assertQueue('add_product', { durable: false })
                    channel_1.consume('add_product', function (msg) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, productRepo.save(JSON.parse(msg.content.toString()))
                                    //channel.publish(exchangeName, '', Buffer.from('Save To Log'))
                                ];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, { noAck: true });
                    // listen to retrive categories
                    channel_1.consume('request_categories', function (msg) { return __awaiter(_this, void 0, void 0, function () {
                        var requestData, categories;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    requestData = JSON.parse(msg.content.toString());
                                    return [4 /*yield*/, categoryRepo.find()];
                                case 1:
                                    categories = _a.sent();
                                    console.log(categories);
                                    channel_1.sendToQueue(requestData.replyTo, Buffer.from(JSON.stringify(categories)));
                                    return [2 /*return*/];
                            }
                        });
                    }); }, { noAck: true });
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.log(e_1.message);
                    return [3 /*break*/, 6];
                case 6:
                    //console.log(resultado)
                    app.listen(8000);
                    return [2 /*return*/];
            }
        });
    });
}
runApp();
