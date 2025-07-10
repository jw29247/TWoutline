import { observable } from "mobx";
import Model from "./base/Model";
import Field from "./decorators/Field";

class Tool extends Model {
  static modelName = "Tool";

  @Field
  @observable
  id: string;

  @Field
  @observable
  title: string;

  @Field
  @observable
  icon: string;

  @Field
  @observable
  url: string;

  @Field
  @observable
  position: number;

  @Field
  @observable
  teamId: string;

  @Field
  @observable
  createdById: string;
}

export default Tool;
