import React from "react";
import { useNavigate } from "react-router-dom";
import PactUserManual from "../screens/Manual";

export function ManualRoute() {
  const navigate = useNavigate();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", background: "#12161A" }}>
      <PactUserManual onClose={() => navigate(-1)} />
    </div>
  );
}
