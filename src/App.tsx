import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useToast } from "./hooks/useToast";
import { Shell, Spinner, Toast } from "./components/ui";
import { LoginScreen } from "./screens/LoginScreen";
import { GroupsScreen } from "./screens/GroupsScreen";
import { CreateGroupScreen } from "./screens/CreateGroupScreen";
import { JoinGroupScreen } from "./screens/JoinGroupScreen";
import { GroupHomeScreen } from "./screens/GroupHomeScreen";
import { MyTasksScreen } from "./screens/MyTasksScreen";
import { ValidateScreen } from "./screens/ValidateScreen";
import { BalancesScreen } from "./screens/BalancesScreen";
import { AdminScreen } from "./screens/AdminScreen";

type Screen =
  | "groups"
  | "create-group"
  | "join-group"
  | "group-home"
  | "my-tasks"
  | "validate"
  | "balances"
  | "admin";

function AuthenticatedApp() {
  const { toast, flash } = useToast();
  const [screen, setScreen] = useState<Screen>("groups");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string>("");
  const [groupsRefreshKey, setGroupsRefreshKey] = useState(0);

  const goToGroups = () => {
    setActiveGroupId(null);
    setGroupsRefreshKey((k) => k + 1);
    setScreen("groups");
  };

  const openGroup = (groupId: string, name?: string) => {
    setActiveGroupId(groupId);
    if (name) setActiveGroupName(name);
    setScreen("group-home");
  };

  return (
    <>
      {screen === "groups" && (
        <GroupsScreen
          refreshKey={groupsRefreshKey}
          onOpenGroup={(id) => openGroup(id)}
          onCreateGroup={() => setScreen("create-group")}
          onJoinGroup={() => setScreen("join-group")}
        />
      )}

      {screen === "create-group" && (
        <CreateGroupScreen onBack={goToGroups} onCreated={(id, name) => openGroup(id, name)} />
      )}

      {screen === "join-group" && (
        <JoinGroupScreen onBack={goToGroups} onJoined={(id, name) => openGroup(id, name)} />
      )}

      {screen === "group-home" && activeGroupId && (
        <GroupHomeScreen
          groupId={activeGroupId}
          onBack={goToGroups}
          onOpenAdmin={() => setScreen("admin")}
          onOpenBalances={() => setScreen("balances")}
          onOpenMyTasks={() => setScreen("my-tasks")}
          onOpenValidate={() => setScreen("validate")}
          onLeft={goToGroups}
          flash={flash}
        />
      )}

      {screen === "my-tasks" && activeGroupId && (
        <MyTasksScreen groupId={activeGroupId} onBack={() => setScreen("group-home")} flash={flash} />
      )}

      {screen === "validate" && activeGroupId && (
        <ValidateScreen groupId={activeGroupId} onBack={() => setScreen("group-home")} flash={flash} />
      )}

      {screen === "balances" && activeGroupId && (
        <BalancesScreen
          groupId={activeGroupId}
          groupName={activeGroupName}
          onBack={() => setScreen("group-home")}
          flash={flash}
        />
      )}

      {screen === "admin" && activeGroupId && (
        <AdminScreen groupId={activeGroupId} onBack={() => setScreen("group-home")} onDeleted={goToGroups} flash={flash} />
      )}

      <Toast toast={toast} />
    </>
  );
}

function Gate() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <Shell>
        <Spinner label="Checking your session…" />
      </Shell>
    );
  }

  if (!user) return <LoginScreen />;

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
