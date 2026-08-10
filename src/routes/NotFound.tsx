import React from "react";
import { Link } from "react-router-dom";
import { CenteredNote, Shell } from "../components/ui";

export function NotFound() {
  return (
    <Shell>
      <CenteredNote>
        Nothing here. <Link to="/" style={{ color: "inherit" }}>Back to your groups</Link>
      </CenteredNote>
    </Shell>
  );
}
