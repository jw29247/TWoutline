# TWoutline - Forked from outline/outline

This project is a fork of [outline/outline](https://github.com/outline/outline) on GitHub with custom modifications.

## Custom Features

### Tools Section in Sidebar

A new "Tools" section has been added to the sidebar that allows administrators to configure custom tool links for their workspace.

#### Features:
- **Admin Configuration**: Workspace administrators can add, edit, and delete custom tools through Settings > Workspace > Tools
- **Tool Properties**: Each tool has:
  - Title: The display name of the tool
  - Icon: An emoji icon (max 2 characters)
  - URL: The link to the tool (internal or external)
- **Sidebar Display**: Tools appear in a dedicated "Tools" section above "Starred" (right after Home, Search, and Drafts)
- **Same Tab Navigation**: Tool links open in the same tab (not new tabs)
- **Conditional Display**: The Tools section only appears if at least one tool is configured

#### Implementation Details:
- Tools are stored in the team preferences (existing JSONB field in the database)
- No new database tables or migrations required
- Uses existing team update API endpoints
- Follows the same component patterns as other sidebar sections

#### Files Modified/Added:
- `shared/types.ts` - Added Tool type and TeamPreference.Tools enum
- `app/scenes/Settings/Tools.tsx` - New settings page for managing tools
- `app/hooks/useSettingsConfig.ts` - Added Tools to settings navigation
- `app/components/Sidebar/components/Tools.tsx` - New sidebar component for displaying tools
- `app/components/Sidebar/App.tsx` - Updated to include Tools section

This feature enables teams to have quick access to their commonly used tools directly from the Outline sidebar.