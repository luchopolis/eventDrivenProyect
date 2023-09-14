import * as amqplib from 'amqplib';

async function initializeChannels(queues: string[], connection: amqplib.Connection): Promise<amqplib.Channel> {
  let channel: amqplib.Channel = await connection.createChannel()

  for(const queue of queues) {
    channel.assertQueue(queue, { durable: false })
  }

  
  return channel
}


export default initializeChannels