import * as winston from 'winston';
import * as config from 'config';
import * as rascal from 'rascal';
import { getServiceAddress } from 'system-endpoints'
import { stringify } from 'querystring'

const promisifyCreateBroker = (rascal: any, rascalConfig: any) => {
  return new Promise((resolve, reject) => {
    return rascal.createBroker(rascalConfig, {}, (err: Error, broker: any) => {
      if (err) {
        console.log("ERROR in createBroker: " + err);
        return reject(err);
      }

      return resolve(broker);
    });
  });
}

const subscribe = (broker: any, queueName: string, logger: any): Promise<void> => {
  return new Promise<void>((resolve: Function, reject: Function) => {
    broker.subscribe(queueName, (err: Error, subscription: any) => {
      if (err) {
        console.log("ERROR in subscribe");
        return reject(err);
      }

      subscription.on(
        "message",
        (msg: any, content: any, ackOrNack: Function) => messageHandler(msg, content, ackOrNack, logger)
      );

      return resolve();
    });
  });
}

const messageHandler = (msg: any, content: any, ackOrNack: Function, logger: any) => {
  const logObj = JSON.parse(content);
  logger.log(logObj.logLevel, logObj.message);
  return ackOrNack();
}

const getFileConfig = () => {
  return {
    level: "info",
    filename: "all-logs.log",
    fullFilePath: "",
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    timestamp: true,
  };
}

const getConsoleConfig = () => {
  return {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true,
  };
}

const createRascalConnectionString = ({ user, password, vhost, hostname, port, options }, endpointAddress: string) => {
  const address = endpointAddress || `${hostname}:${port}`;
  const optionString = stringify(options);
  return `amqp://${user}:${password}@${address}/${vhost}?${optionString}`
}

const createBroker = async (rascalConfig) => {
  const endpointAddress = getServiceAddress('localhost:5672');
  const connection = createRascalConnectionString(rascalConfig.vhosts.flowershop.connection, endpointAddress)
  const config = { vhosts: { flowershop: { ...rascalConfig.vhosts.flowershop, connection } } };
  return await promisifyCreateBroker(rascal, rascal.withDefaultConfig(config));
}

export default async function main() {
  const logger = new winston.Logger({
    transports: [
      new winston.transports.File(getFileConfig()),
      new winston.transports.Console(getConsoleConfig()),
    ],
    exitOnError: false,
  });
  const rascalConfig = config.get('rascal');
  const broker = await createBroker(rascalConfig);
  subscribe(broker, <string> config.get('loggerQueueName'), logger);
}
