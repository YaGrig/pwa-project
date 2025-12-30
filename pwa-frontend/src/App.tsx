import React, { useEffect } from "react";
import "effector/enable_debug_traces";
import "./App.css";
import AuthForm from "./features/authorization/ui";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useLoginForm } from "./features/authorization/lib/hooks/useLoginForm";
import { TransactionForm } from "./features/transaction/ui";
import { ProtectedRoute } from "./common/wrapper/auth.wrapper";
import { useSocket } from "./features/websocket/lib/hooks/useSocket";
import { ThemeProvider } from "@mui/material";
import { theme } from "./common/theme";
import { Home } from "./features/home";
import { Layout } from "./common/components/Layout";
import { useRefreshQuery } from "./features/authorization/model/queries";
import { socketConnectedEvent } from "./features/websocket/model/store";
// import { ProtectedRoute } from "./common/wrapper/auth.wrapper";

function App() {
  const { appStartedEvent, authError } = useLoginForm();
  const { socketInit, isConnected } = useSocket();
  // const data = useRefreshQuery();

  // console.log(data);
  useEffect(() => {
    socketInit();
    appStartedEvent();
  }, [appStartedEvent, socketInit]);

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Layout>
              <Routes>
                <Route
                  path="/transaction"
                  element={
                    <ProtectedRoute>
                      <TransactionForm />
                    </ProtectedRoute>
                  }
                />
                <Route path="/auth" element={<AuthForm />} />
                <Route path="*" element={<div>Error Page</div>} />
                <Route path="/" element={<Home />} />
              </Routes>
            </Layout>
          </LocalizationProvider>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
