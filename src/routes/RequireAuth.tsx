import React from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { Shell, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { Flash } from "./RootLayout";

export function RequireAuth() {
  const { user, initializing, pendingVerificationEmail } = useAuth();
  const context = useOutletContext<{ flash: Flash }>();
  if (initializing) {
    return (
      <Shell>
        <Spinner label="Checking your session…" />
      </Shell>
    );
  }

  if (pendingVerificationEmail) return <Navigate to="/verify" replace />;
  if (!user) return <Navigate to="/login" replace />;

  return  <Outlet context={context} />;;
}
