import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public category: string;

  @column()
  public price: number;

  @belongsTo(() => User)
  public uploader: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
