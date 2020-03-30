import config from 'config'
import { flags } from '@oclif/command'

import { appFactory, isSupportedServices, SupportedServices } from '../app'
import { loggingFactory } from '../logger'
import { Flags, Config } from '../types'
import { BaseCLICommand } from '../utils'

const logger = loggingFactory('cli:start')

export default class StartServer extends BaseCLICommand {
  static get description () {
    const formattedServices = Object.values(SupportedServices).map(service => ` - ${service}`).join('\n')
    return `start the caching server

Currently supported services:
${formattedServices}`
  }

  static examples = ['$ rif-marketplace-cache start --disable service1 --disable service2 --enable service3']

  static flags = {
    ...BaseCLICommand.flags,
    port: flags.integer({ char: 'p', description: 'port to attach the server to' }),
    db: flags.string({ description: 'database connection URI', env: 'RIFM_DB' }),
    provider: flags.string({ description: 'blockchain provider connection URI', env: 'RIFM_PROVIDER' }),
    enable: flags.string({ char: 'e', multiple: true, description: 'enable specific service' }),
    disable: flags.string({ char: 'd', multiple: true, description: 'disable specific service' })
  }

  buildConfigObject (flags: Flags<typeof StartServer>): object {
    const output: Config = {}

    if (flags.db) {
      output.db = flags.db
    }

    if (flags.provider) {
      output.blockchain = { provider: flags.provider }
    }

    if (flags.port) {
      output.port = flags.port
    }

    if (flags.enable) {
      for (const enableService of flags.enable) {
        if (!isSupportedServices(enableService)) {
          this.error(`${enableService} is unknown service!`)
        }

        if (!output[enableService]) {
          output[enableService] = {}
        }

        output[enableService]!.enabled = true
      }
    }

    if (flags.disable) {
      for (const disableService of flags.disable) {
        if (!isSupportedServices(disableService)) {
          this.error(`${disableService} is unknown service!`)
        }

        if (flags.enable && flags.enable.includes(disableService)) {
          this.error(`${disableService} is already enabled in your other parameter!`)
        }

        if (!output[disableService]) {
          output[disableService] = {}
        }

        output[disableService]!.enabled = false
      }
    }

    return output
  }

  // TODO: DB connnection setting
  // TODO: Provider connection setting
  run (): Promise<void> {
    const { flags } = this.parse(StartServer)

    const configOverrides = this.buildConfigObject(flags)
    config.util.extendDeep(config, configOverrides)

    const app = appFactory()

    const port = config.get('port')
    const server = app.listen(port)

    process.on('unhandledRejection', err =>
      logger.error(`Unhandled Rejection at: ${err}`)
    )

    server.on('listening', () =>
      this.log('Server started on port %d', port)
    )

    return Promise.resolve()
  }
}