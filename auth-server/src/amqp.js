const amqp = require('amqplib')
const {
  AMQP_URL,
  AMQP_AUDITLOG_EXCHANGE,
} = require('./env')

let connection;
let channel;

async function connect() {
  connection = await amqp.connect(AMQP_URL)
  channel = await connection.createChannel()
}

async function auditLog() {
  const queue = AMQP_AUDITLOG_EXCHANGE

  channel.assertQueue(queue, {
    durable: true,
  })

  const send = (data) => {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
  }

  return {
    send,
  }
}

module.exports = {
  connect,
  auditLog,
}