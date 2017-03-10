const { name } = require('../../package.json')
import System from 'corpjs-system'
import Config from 'corpjs-config'
import Endpoints from 'corpjs-endpoints'
import Logger from 'corpjs-logger'
import Amqp from 'corpjs-amqp'
import Consumer from './Consumer'

export default new System({ name })
  .add('config', new Config()
    .add(() => Config.loaders.require({ path: 'config/default.js', watch: true }))
    .add(() => Config.loaders.require({ path: 'config/test.js', watch: true })))
  .add('endpoints', Endpoints()).dependsOn({ component: 'config', source: 'endpoints', as: 'config' })
  .add('logger', Logger()).dependsOn({ component: 'config', source: 'logger', as: 'config' })
  .add('connection', Amqp.Connection()).dependsOn({ component: 'config', source: 'rabbit', as: 'config' }, 'endpoints')
  .add('channel', Amqp.Channel()).dependsOn('connection')
  .add('consumer', Consumer()).dependsOn('config', 'logger', 'channel')
  .logAllEvents()