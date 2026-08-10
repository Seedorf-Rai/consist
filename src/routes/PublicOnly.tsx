import React from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { Shell, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { Flash } from "./RootLayout";

export function PublicOnly({ requireVerificationPending = false }: { requireVerificationPending?: boolean }) {
  const { user, initializing, pendingVerificationEmail } = useAuth();
  const context = useOutletContext<{ flash: Flash }>();
  if (initializing) {
    return (
      <Shell>
        <Spinner label="Checking your session…" />
      </Shell>
    );
  }

  if (user) return <Navigate to="/" replace />;

  // /verify only makes sense mid-signup; /login only makes sense once that's done.
  if (requireVerificationPending && !pendingVerificationEmail) return <Navigate to="/login" replace />;
  if (!requireVerificationPending && pendingVerificationEmail) return <Navigate to="/verify" replace />;

  return <Outlet context={context} />;
}
