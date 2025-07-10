import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  IsUUID,
  Scopes,
  Table,
} from "sequelize-typescript";
import Team from "./Team";
import User from "./User";
import IdModel from "./base/IdModel";
import Fix from "./decorators/Fix";

@DefaultScope(() => ({
  order: [
    ["position", "ASC"],
    ["createdAt", "ASC"],
  ],
}))
@Scopes(() => ({
  withTeam: {
    include: [
      {
        association: "team",
        required: true,
      },
    ],
  },
  withUser: {
    include: [
      {
        association: "user",
        required: true,
      },
    ],
  },
}))
@Table({ tableName: "tools", modelName: "tool" })
@Fix
class Tool extends IdModel<Tool> {
  @Column(DataType.STRING)
  title: string;

  @Column(DataType.STRING)
  icon: string;

  @Column(DataType.TEXT)
  url: string;

  @Column(DataType.INTEGER)
  position: number;

  // associations

  @BelongsTo(() => User, "createdById")
  user: User;

  @IsUUID(4)
  @Column(DataType.UUID)
  @ForeignKey(() => User)
  createdById: string;

  @BelongsTo(() => Team, "teamId")
  team: Team;

  @IsUUID(4)
  @Column(DataType.UUID)
  @ForeignKey(() => Team)
  teamId: string;
}

export default Tool;
