import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import useStores from "~/hooks/useStores";
import Header from "./Header";
import SidebarLink from "./SidebarLink";

function Tools() {
  const { t } = useTranslation();
  const { tools } = useStores();

  // Fetch tools when component mounts
  React.useEffect(() => {
    void tools.fetchPage({});
  }, [tools]);

  // Don't show the section if there are no tools
  if (!tools.orderedData.length) {
    return null;
  }

  return (
    <Header id="tools" title={t("Tools")}>
      {tools.orderedData.map((tool) => (
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
