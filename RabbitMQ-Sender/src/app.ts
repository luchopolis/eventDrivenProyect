import * as express from 'express'
import {Request, Response} from 'express'
import * as cors from 'cors'
import "reflect-metadata"
import AppDataSource from './db/db'
import { Product } from './entity/product'

import * as amqplib from 'amqplib';
import ProductDTO from './dto/product.dto'


const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))

app.use(express.json())

AppDataSource.initialize().then().catch(a => console.log(a)) 
console.log('Listent to port: 8001')

app.post('/products', async (req: Request, res: Response) => {
  //const resultado = await dbRepository.find()
  let channel: amqplib.Channel = null
  try {
    const connR = await amqplib.connect('amqp://localhost')
    const product = req.body as { name: string, price: number, categoryId: number }

    // send to a queue 
    channel = await connR.createChannel()
    channel.sendToQueue('add_product', Buffer.from(JSON.stringify(product)))
  } catch(e) {
    console.log(e.message);
  }
  return res.send({ data: 'Saved' })
})

app.get('/products', async (_req: Request, res: Response) => {

  let channel: amqplib.Channel = null
  const connR = await amqplib.connect('amqp://localhost')
  channel = await connR.createChannel()

  try {
    // replyQueue
    const replyQueue = await channel.assertQueue('', { exclusive: true })
    console.log(replyQueue.queue);
    
    channel.sendToQueue('request_categories', Buffer.from(JSON.stringify({ replyTo: replyQueue.queue })))
    const dbRepository = AppDataSource.getRepository(Product)

    const responseCategories: { id: number, name: string}[] = await new Promise((resolve) => {
      channel.consume(replyQueue.queue, (msg) => {
        resolve(JSON.parse(msg.content.toString()));
      }, { noAck: true });
    })
   
    const result = await dbRepository.find()

    let resultWithCategory = result.map(r => {
      const dtoProduct = new ProductDTO()

        let category = null
      if (r.categoryId){
        category = responseCategories.find(c => c.id === r.categoryId)        
      }

      dtoProduct.id = r.id
      dtoProduct.name = r.name
      dtoProduct.price = r.price
      dtoProduct.categoryId = r.categoryId
      dtoProduct.categoryName = category ? category.name : null
    
      return {...dtoProduct}
    })

    return res.send({ data: resultWithCategory })
  } catch (e) {
    console.log(e.message);
    
  }
})

app.listen(8001)
