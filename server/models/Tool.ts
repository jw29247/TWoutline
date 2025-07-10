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

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  @IsUUID(4)
  createdById: string;

  @BelongsTo(() => Team, "teamId")
  team: Team;

  @ForeignKey(() => Team)
  @Column(DataType.UUID)
  @IsUUID(4)
  teamId: string;
}

export default Tool;
