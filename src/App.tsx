import { AppShell } from "./components/AppShell";
import { DocumentSurface } from "./components/DocumentSurface";
import { useSidebarResize } from "./hooks/useSidebarResize";

export default function App() {
  const sidebar = useSidebarResize();

  return (
    <AppShell
      sidebarWidth={sidebar.width}
      sidebarCollapsed={sidebar.collapsed}
      sidebarResizing={sidebar.resizing}
      onSidebarExpand={sidebar.expand}
      resizeHandleProps={sidebar.handleProps}
    >
      <DocumentSurface />
    </AppShell>
  );
}
