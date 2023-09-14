import * as express from 'express'
import {Request, Response} from 'express'
import * as cors from 'cors'
import "reflect-metadata"
import AppDataSource from './db/db'
import { Product } from './entity/product'
import { Category } from './entity/category'

import * as amqplib from 'amqplib';
import initializeChannels from './queues'

// queue rabbit
const queue = 'product'
const exchangeName = 'add_logs'

const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))

app.use(express.json())

console.log('Listent to port: 8000')

async function initializeChannelsQueues(con: amqplib.Connection) {
  return await initializeChannels(['add_product', 'request_categories'], con)
}

async function runApp() {
  await AppDataSource.initialize()

  const productRepo = AppDataSource.getRepository(Product)
  const categoryRepo = AppDataSource.getRepository(Category)
  
  
    try {
      //let channel: amqplib.Channel = null
      const connR = await amqplib.connect('amqp://localhost')

      const channel = await initializeChannelsQueues(connR)
      
    // create a channel
    //channel = await connR.createChannel()
    //await channel.assertQueue('add_product', { durable: false })

    channel.consume('add_product', async (msg) => {
      await productRepo.save(JSON.parse(msg.content.toString()))
      //channel.publish(exchangeName, '', Buffer.from('Save To Log'))
    }, { noAck: true })


    // listen to retrive categories
    channel.consume('request_categories', async (msg) => {
      const requestData = JSON.parse(msg.content.toString())
      const categories = await categoryRepo.find()
      
      channel.sendToQueue(requestData.replyTo, Buffer.from(JSON.stringify(categories)))
    }, { noAck: true })
    
  } catch(e) {
    console.log(e.message);
  }
  //console.log(resultado)
  app.listen(8000)
} 

runApp()
