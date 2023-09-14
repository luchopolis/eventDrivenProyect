"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var amqplib = require("amqplib");
var product_dto_1 = require("./dto/product.dto");
var app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}));
app.use(express.json());
db_1.default.initialize().then().catch(function (a) { return console.log(a); });
console.log('Listent to port: 8001');
app.post('/products', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var channel, connR, product, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                channel = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, amqplib.connect('amqp://localhost')];
            case 2:
                connR = _a.sent();
                product = req.body;
                return [4 /*yield*/, connR.createChannel()];
            case 3:
                // send to a queue 
                channel = _a.sent();
                channel.sendToQueue('add_product', Buffer.from(JSON.stringify(product)));
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.log(e_1.message);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, res.send({ data: 'Saved' })];
        }
    });
}); });
app.get('/products', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var channel, connR, replyQueue_1, dbRepository, responseCategories_1, result, resultWithCategory, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                channel = null;
                return [4 /*yield*/, amqplib.connect('amqp://localhost')];
            case 1:
                connR = _a.sent();
                return [4 /*yield*/, connR.createChannel()];
            case 2:
                channel = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 7, , 8]);
                return [4 /*yield*/, channel.assertQueue('', { exclusive: true })];
            case 4:
                replyQueue_1 = _a.sent();
                console.log(replyQueue_1.queue);
                channel.sendToQueue('request_categories', Buffer.from(JSON.stringify({ replyTo: replyQueue_1.queue })));
                dbRepository = db_1.default.getRepository(product_1.Product);
                return [4 /*yield*/, new Promise(function (resolve) {
                        channel.consume(replyQueue_1.queue, function (msg) {
                            resolve(JSON.parse(msg.content.toString()));
                        }, { noAck: true });
                    })];
            case 5:
                responseCategories_1 = _a.sent();
                return [4 /*yield*/, dbRepository.find()];
            case 6:
                result = _a.sent();
                resultWithCategory = result.map(function (r) {
                    var dtoProduct = new product_dto_1.default();
                    var category = null;
                    if (r.categoryId) {
                        category = responseCategories_1.find(function (c) { return c.id === r.categoryId; });
                    }
                    dtoProduct.id = r.id;
                    dtoProduct.name = r.name;
                    dtoProduct.price = r.price;
                    dtoProduct.categoryId = r.categoryId;
                    dtoProduct.categoryName = category ? category.name : null;
                    return __assign({}, dtoProduct);
                });
                return [2 /*return*/, res.send({ data: resultWithCategory })];
            case 7:
                e_2 = _a.sent();
                console.log(e_2.message);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
app.listen(8001);
