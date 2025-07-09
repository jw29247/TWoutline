import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TeamPreference, Tool } from "@shared/types";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import Header from "./Header";
import SidebarLink from "./SidebarLink";

function Tools() {
  const { t } = useTranslation();
  const team = useCurrentTeam();

  // Get tools from team preferences
  const tools = React.useMemo(() => {
    const toolsFromPrefs = team.preferences?.[TeamPreference.Tools];
    return Array.isArray(toolsFromPrefs) ? toolsFromPrefs : [];
  }, [team.preferences]);

  if (!tools.length) {
    return null;
  }

  return (
    <Header id="tools" title={t("Tools")}>
      {tools.map((tool: Tool) => (
        <SidebarLink
          key={tool.id}
          to={tool.url}
          icon={<span>{tool.icon}</span>}
          label={tool.title}
        />
      ))}
    </Header>
  );
}

export default observer(Tools);
