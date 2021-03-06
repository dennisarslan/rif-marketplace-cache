import { Table, DataType, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript'

import Domain from './domain.model'

@Table({ freezeTableName: true, tableName: 'rns_domain-offer', timestamps: false })
export default class DomainOffer extends Model {
  @Column({ primaryKey: true, type: DataType.STRING })
  offerId!: string

  @ForeignKey(() => Domain)
  @Column(DataType.STRING)
  tokenId!: string

  @BelongsTo(() => Domain)
  domain!: Domain

  @Column(DataType.STRING)
  ownerAddress!: string

  @Column(DataType.STRING)
  ownerDomain!: string

  @Column(DataType.STRING)
  paymentToken!: string

  @Column(DataType.DECIMAL)
  price!: number

  @Column(DataType.STRING)
  priceString!: string

  @Column(DataType.DATE)
  creationDate!: number
}
