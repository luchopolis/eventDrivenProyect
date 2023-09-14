import { DataSource } from "typeorm"
import { Product } from "../entity/product"
import { Category } from "../entity/category"

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root1',
  database: 'rabbitdb',
  entities: [Product, Category]
})


export default AppDataSource