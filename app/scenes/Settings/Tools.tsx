import { observer } from "mobx-react";
import { PlusIcon, ToolsIcon, TrashIcon } from "outline-icons";
import { useCallback, useState } from "react";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { TeamPreference, Tool } from "@shared/types";
import Button from "~/components/Button";
import Heading from "~/components/Heading";
import Input from "~/components/Input";
import Scene from "~/components/Scene";
import Text from "~/components/Text";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import { ActionRow } from "./components/ActionRow";
import SettingRow from "./components/SettingRow";

function Tools() {
  const { t } = useTranslation();
  const team = useCurrentTeam();

  // Initialize tools from team preferences
  const initialTools = React.useMemo(() => {
    const toolsFromPrefs = team.preferences?.[TeamPreference.Tools];
    return Array.isArray(toolsFromPrefs) ? toolsFromPrefs : [];
  }, [team.preferences]);

  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Update tools when team preferences change
  React.useEffect(() => {
    const toolsFromPrefs = team.preferences?.[TeamPreference.Tools];
    if (Array.isArray(toolsFromPrefs)) {
      setTools(toolsFromPrefs);
    }
  }, [team.preferences]);

  const handleSubmit = useCallback(
    async (event?: React.SyntheticEvent) => {
      if (event) {
        event.preventDefault();
      }

      try {
        // Create a new preferences object with the tools
        const updatedPreferences = {
          ...team.preferences,
          [TeamPreference.Tools]: tools,
        };

        // Save the team with updated preferences
        await team.save({
          preferences: updatedPreferences,
        });

        toast.success(t("Tools saved"));
      } catch (err) {
        toast.error(err.message);
      }
    },
    [team, tools, t]
  );

  const handleAddTool = useCallback(() => {
    const newTool: Tool = {
      id: uuidv4(),
      title: "",
      icon: "🔧",
      url: "",
    };
    setEditingTool(newTool);
    setShowAddForm(true);
  }, []);

  const handleSaveTool = useCallback(() => {
    if (!editingTool || !editingTool.title || !editingTool.url) {
      toast.error(t("Please fill in all fields"));
      return;
    }

    const existingIndex = tools.findIndex((t) => t.id === editingTool.id);
    if (existingIndex >= 0) {
      const updatedTools = [...tools];
      updatedTools[existingIndex] = editingTool;
      setTools(updatedTools);
    } else {
      setTools([...tools, editingTool]);
    }

    setEditingTool(null);
    setShowAddForm(false);
  }, [editingTool, tools, t]);

  const handleCancelEdit = useCallback(() => {
    setEditingTool(null);
    setShowAddForm(false);
  }, []);

  const handleDeleteTool = useCallback((id: string) => {
    setTools((currentTools) => currentTools.filter((tool) => tool.id !== id));
  }, []);

  const handleEditTool = useCallback((tool: Tool) => {
    setEditingTool(tool);
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

      <form onSubmit={handleSubmit}>
        <Heading as="h2">{t("Custom Tools")}</Heading>

        {tools.map((tool) => (
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
              editingTool.id && tools.find((tool) => tool.id === editingTool.id)
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
                <Button onClick={handleSaveTool} primary>
                  {editingTool.id &&
                  tools.find((tool) => tool.id === editingTool.id)
                    ? t("Update")
                    : t("Add")}
                </Button>
                <Button onClick={handleCancelEdit} neutral>
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

        <ActionRow>
          <Button type="submit" disabled={team.isSaving}>
            {team.isSaving ? `${t("Saving")}…` : t("Save")}
          </Button>
        </ActionRow>
      </form>
    </Scene>
  );
}

export default observer(Tools);
