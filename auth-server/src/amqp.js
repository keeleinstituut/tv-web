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

function checkHealth() {
  try {
    if (!connection || !channel) {
      return false
    }

    if (connection.connection && connection.connection.closing) {
      return false
    }

    return !channel.closed;
  } catch (error) {
    return false
  }
}

module.exports = {
  connect,
  auditLog,
  checkHealth,
}