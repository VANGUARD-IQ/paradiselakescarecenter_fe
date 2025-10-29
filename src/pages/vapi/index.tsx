import React from "react";
import { Routes, Route } from "react-router-dom";
import { VapiDashboard } from "./VapiDashboard";
import { WebCall } from "./WebCall";
import { CallLogs } from "./CallLogs";
import { VapiTodos } from "./VapiTodos";

export const VapiModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<VapiDashboard />} />
      <Route path="/web-call" element={<WebCall />} />
      <Route path="/call-logs" element={<CallLogs />} />
      <Route path="/todos" element={<VapiTodos />} />
    </Routes>
  );
};

export { VapiDashboard } from "./VapiDashboard";
export { WebCall } from "./WebCall";
export { CallLogs } from "./CallLogs";
export { VapiTodos } from "./VapiTodos";