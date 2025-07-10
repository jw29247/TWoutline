import { observer } from "mobx-react";
import { PlusIcon, ToolsIcon, TrashIcon } from "outline-icons";
import { useCallback, useState } from "react";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import Tool from "~/models/Tool";
import Button from "~/components/Button";
import Heading from "~/components/Heading";
import Input from "~/components/Input";
import Scene from "~/components/Scene";
import Text from "~/components/Text";
import useStores from "~/hooks/useStores";
import SettingRow from "./components/SettingRow";

function Tools() {
  const { t } = useTranslation();
  const { tools } = useStores();

  const [editingTool, setEditingTool] = useState<Partial<Tool> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    void tools.fetchPage({});
  }, [tools]);

  const handleAddTool = useCallback(() => {
    const newTool: Partial<Tool> = {
      id: uuidv4(),
      title: "",
      icon: "🔧",
      url: "",
    };
    setEditingTool(newTool);
    setShowAddForm(true);
  }, []);

  const handleSaveTool = useCallback(async () => {
    if (!editingTool || !editingTool.title || !editingTool.url) {
      toast.error(t("Please fill in all fields"));
      return;
    }

    setIsSaving(true);
    try {
      const existingTool = editingTool.id ? tools.get(editingTool.id) : null;

      if (existingTool) {
        await tools.update({
          id: existingTool.id,
          title: editingTool.title,
          icon: editingTool.icon!,
          url: editingTool.url,
        });
        toast.success(t("Tool updated"));
      } else {
        await tools.create({
          title: editingTool.title,
          icon: editingTool.icon!,
          url: editingTool.url,
        });
        toast.success(t("Tool created"));
      }

      setEditingTool(null);
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err.message || t("An error occurred"));
    } finally {
      setIsSaving(false);
    }
  }, [editingTool, tools, t]);

  const handleCancelEdit = useCallback(() => {
    setEditingTool(null);
    setShowAddForm(false);
  }, []);

  const handleDeleteTool = useCallback(
    async (id: string) => {
      try {
        await tools.delete(id);
        toast.success(t("Tool deleted"));
      } catch (err: any) {
        toast.error(err.message || t("An error occurred"));
      }
    },
    [tools, t]
  );

  const handleEditTool = useCallback((tool: Tool) => {
    setEditingTool({
      id: tool.id,
      title: tool.title,
      icon: tool.icon,
      url: tool.url,
    });
    setShowAddForm(true);
  }, []);

  return (
    <Scene title={t("Tools")} icon={<ToolsIcon />}>
      <Heading>{t("Tools")}</Heading>
      <Text as="p" type="secondary">
        <Trans>
          Add custom tools to the sidebar for quick access. These tools will be
          available to all members of your workspace.
        </Trans>
      </Text>

      <Heading as="h2">{t("Custom Tools")}</Heading>

      {tools.orderedData.map((tool) => (
        <SettingRow
          key={tool.id}
          name={`tool-${tool.id}`}
          label={
            <span>
              {tool.icon} {tool.title}
            </span>
          }
          description={tool.url}
        >
          <Button onClick={() => handleEditTool(tool)} neutral>
            {t("Edit")}
          </Button>
          <Button
            onClick={() => handleDeleteTool(tool.id)}
            neutral
            style={{ marginLeft: 8 }}
          >
            <TrashIcon />
          </Button>
        </SettingRow>
      ))}

      {showAddForm && editingTool && (
        <SettingRow
          name="add-tool"
          label={
            editingTool.id && tools.get(editingTool.id)
              ? t("Edit Tool")
              : t("Add Tool")
          }
          border={false}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Input
                value={editingTool.icon}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingTool({ ...editingTool, icon: e.target.value })
                }
                placeholder={t("Emoji")}
                maxLength={2}
                style={{ width: 60 }}
                required
              />
              <Input
                value={editingTool.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditingTool({ ...editingTool, title: e.target.value })
                }
                placeholder={t("Tool name")}
                required
                style={{ flex: 1 }}
              />
            </div>
            <Input
              value={editingTool.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingTool({ ...editingTool, url: e.target.value })
              }
              placeholder={t("https://example.com")}
              required
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={handleSaveTool} primary disabled={isSaving}>
                {isSaving
                  ? `${t("Saving")}…`
                  : editingTool.id && tools.get(editingTool.id)
                    ? t("Update")
                    : t("Add")}
              </Button>
              <Button onClick={handleCancelEdit} neutral disabled={isSaving}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        </SettingRow>
      )}

      {!showAddForm && (
        <SettingRow name="add-tool-button" label="" border={false}>
          <Button onClick={handleAddTool} icon={<PlusIcon />} neutral>
            {t("Add Tool")}
          </Button>
        </SettingRow>
      )}
    </Scene>
  );
}

export default observer(Tools);
