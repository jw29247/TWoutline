import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { TeamPreference, Tool } from "@shared/types";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import Header from "./Header";
import SidebarLink from "./SidebarLink";

function Tools() {
  const { t } = useTranslation();
  const team = useCurrentTeam();
  const tools = team.getPreference(TeamPreference.Tools) || [];

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
