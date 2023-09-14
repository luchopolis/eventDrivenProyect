import * as amqplib from 'amqplib';

async function initializeExchanges(exchange: string, connection: amqplib.Connection): Promise<{
  channel: amqplib.Channel,
  queue: any
}> {
  let channel: amqplib.Channel = await connection.createChannel()

  await channel.assertExchange(exchange, 'fanout', {
     durable: false
  })

  const { queue } = await channel.assertQueue(`queue_${exchange}`, {
    exclusive: true
  })
    
  channel.bindQueue(queue, exchange, '')
  
  return {
    channel,
    queue
  }
}


export default initializeExchanges