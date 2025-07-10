import { action, runInAction } from "mobx";
import Tool from "~/models/Tool";
import RootStore from "./RootStore";
import Store from "./base/Store";

export default class ToolsStore extends Store<Tool, RootStore> {
  constructor(rootStore: RootStore) {
    super(rootStore, Tool);
  }

  @action
  reorder = async (tools: Tool[]) => {
    // Update positions locally first for immediate UI feedback
    runInAction(() => {
      tools.forEach((tool, index) => {
        tool.position = index;
      });
    });

    // Prepare the reorder data
    const reorderData = tools.map((tool, index) => ({
      id: tool.id,
      position: index,
    }));

    // Send to server
    await this.client.post("/tools.reorder", {
      tools: reorderData,
    });
  };

  @action
  move = async (id: string, index: number) => {
    const tool = this.get(id);
    if (!tool) {return;}

    const tools = this.orderedData;
    const currentIndex = tools.findIndex((t) => t.id === id);

    // Remove from current position and insert at new position
    tools.splice(currentIndex, 1);
    tools.splice(index, 0, tool);

    // Reorder all tools
    await this.reorder(tools);
  };

  get orderedData(): Tool[] {
    return this.data.slice().sort((a, b) => {
      if (a.position === b.position) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return a.position - b.position;
    });
  }
}

export const getToolsStore = (): ToolsStore => {
  throw new Error("getToolsStore must be overridden");
};
