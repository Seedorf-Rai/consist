import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./routes/RootLayout";
import { RequireAuth } from "./routes/RequireAuth";
import { PublicOnly } from "./routes/PublicOnly";
import { ManualRoute } from "./routes/ManualRoute";
import { NotFound } from "./routes/NotFound";

import { LoginScreen } from "./screens/LoginScreen";
import { VerifyOtpScreen } from "./screens/VerifyOtp";
import { GroupsScreen } from "./screens/GroupsScreen";
import { CreateGroupScreen } from "./screens/CreateGroupScreen";
import { JoinGroupScreen } from "./screens/JoinGroupScreen";
import { GroupHomeScreen } from "./screens/GroupHomeScreen";
import { MyTasksScreen } from "./screens/MyTasksScreen";
import { ValidateScreen } from "./screens/ValidateScreen";
import { BalancesScreen } from "./screens/BalancesScreen";
import { AdminScreen } from "./screens/AdminScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { MemberTasksScreen } from "./screens/MemberTaskScreen";

// createBrowserRouter takes a plain array of route objects — nesting is just
// objects with a `children` array. RootLayout renders <Outlet/> plus the
// always-on help button + toast; RequireAuth/PublicOnly gate their subtrees
// and redirect via <Navigate/> rather than each screen checking auth itself.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicOnly />,
        children: [{ path: "/login", element: <LoginScreen /> }],
      },
      {
        element: <PublicOnly requireVerificationPending />,
        children: [{ path: "/verify", element: <VerifyOtpScreen /> }],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: "/", element: <GroupsScreen /> },
          { path: "/groups/new", element: <CreateGroupScreen /> },
          { path: "/groups/join", element: <JoinGroupScreen /> },
          { path: "/groups/:groupId", element: <GroupHomeScreen /> },
          { path: "/groups/:groupId/tasks", element: <MyTasksScreen /> },
          { path: "/groups/:groupId/validate", element: <ValidateScreen /> },
          { path: "/groups/:groupId/balances", element: <BalancesScreen /> },
          { path: "/groups/:groupId/admin", element: <AdminScreen /> },
          { path: "/groups/:groupId/history", element: <HistoryScreen /> },
          { path: "/groups/:groupId/members/:userId/tasks", element: <MemberTasksScreen /> }
        ],
      },
      // Reachable from any screen, logged in or not — matches the original
      // floating help button that worked regardless of auth state.
      { path: "/manual", element: <ManualRoute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
