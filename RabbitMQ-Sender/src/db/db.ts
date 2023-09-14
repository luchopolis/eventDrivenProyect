import { DataSource } from "typeorm"
import { Product } from "../entity/product"

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root1',
  database: 'rabbitdb',
  entities: [Product]
})


export default AppDataSource