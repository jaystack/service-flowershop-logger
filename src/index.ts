import * as winston from 'winston';
import * as config from 'config';
import * as rascal from 'rascal';
import * as express from 'express';

function promisifyCreateBroker(rascal: any, rascalConfig: any) {
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

function subscribe(broker: any, queueName: string, logger: any): Promise<void> {
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

function messageHandler(msg: any, content: any, ackOrNack: Function, logger: any) {
  const logObj = JSON.parse(content);
  logger.log(logObj.logLevel, logObj.message);
  return ackOrNack();
}

function getFileConfig() {
  return {
    level: "info",
    filename: "all-logs.log",
    fullFilePath: "",
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    timestamp: true
  };
}

function getConsoleConfig() {
  return {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true
  };
}

export default async function main() {
  const logger = new winston.Logger({
    transports: [
      new winston.transports.File(getFileConfig()),
      new winston.transports.Console(getConsoleConfig())
    ],
    exitOnError: false
  });
  const broker = await promisifyCreateBroker(rascal, rascal.withDefaultConfig(config.get('rascal')));
  subscribe(broker, <string>config.get('loggerQueueName'), logger);
}