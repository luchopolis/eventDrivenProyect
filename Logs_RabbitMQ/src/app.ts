import * as express from 'express'
import {Request, Response} from 'express'
import * as cors from 'cors'
import "reflect-metadata"
import AppDataSource from './db/db'
import { Product } from './entity/product'

import * as amqplib from 'amqplib';
import initializeChannels from './queues'
import initializeExchanges from './exchanges'


const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))

app.use(express.json())

console.log('Listent to port: 8000')

async function initializeChannelsQueues(con: amqplib.Connection) {
  return await initializeChannels(['add_logs'], con)
}

async function initializeChannelExchanges(con: amqplib.Connection) {
  
  // listen exchange
  const { channel, queue } = await initializeExchanges('add_logs', con)
  
  channel.consume(queue, (msg) => {
    console.log('********** LOGS **********');
    
    console.log(msg.content.toString());
  })
}

async function runApp() {
  await AppDataSource.initialize()

  const productRepo = AppDataSource.getRepository(Product)
  
  
    try {
      //let channel: amqplib.Channel = null
      const connR = await amqplib.connect('amqp://localhost')
      await initializeChannelExchanges(connR)
  } catch(e) {
    console.log(e.message);
  }
  //console.log(resultado)
  app.listen(8002)
} 

runApp()
