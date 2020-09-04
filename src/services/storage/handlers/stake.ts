import { EventData } from 'web3-eth-contract'

import { loggingFactory } from '../../../logger'
import { Handler } from '../../../definitions'
import { StorageServices } from '../index'
import StakeModel from '../models/stake.model'

const logger = loggingFactory('storage:handler:stake')

const handlers = {
  async Staked (event: EventData, { stakeService }: StorageServices): Promise<void> {
    const { user: account, total, data, amount } = event.returnValues

    // TODO Update specific stake based on token
    const [, [stake]] = await StakeModel.update({ total }, { where: { account, tokenAddress: data } })
    logger.info(`Account ${account} stake amount ${amount}, final balance ${total}`)

    if (stakeService.emit) stakeService.emit('updated', stake.toJSON())
  },

  async Unstaked (event: EventData, { stakeService }: StorageServices): Promise<void> {
    const { user: account, total, data, amount } = event.returnValues

    // TODO Update specific stake based on token
    const [, [stake]] = await StakeModel.update({ total }, { where: { account, tokenAddress: data } })
    logger.info(`Account ${account} unstack amount ${amount}, final balance ${total}`)

    if (stakeService.emit) stakeService.emit('updated', stake.toJSON())
  }
}

function isValidEvent (value: string): value is keyof typeof handlers {
  return value in handlers
}

const handler: Handler<StorageServices> = {
  events: ['Staked', 'Unstaked'],
  process (event: EventData, services: StorageServices): Promise<void> {
    if (!isValidEvent(event.event)) {
      return Promise.reject(new Error(`Unknown event ${event.event}`))
    }

    return handlers[event.event](event, services)
  }
}
export default handler
