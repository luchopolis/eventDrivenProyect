"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var product_1 = require("../entity/product");
var category_1 = require("../entity/category");
var AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root1',
    database: 'rabbitdb',
    entities: [product_1.Product, category_1.Category]
});
exports.default = AppDataSource;
