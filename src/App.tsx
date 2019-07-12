import React from "react";
import { ConfigurationView } from "./views/configurationMatrix";
import { threeRegions, usersTable } from "./configurations";
import "./App.css";

function App() {
  return (
    <>
      <ConfigurationView
        config={{
          formation: threeRegions,
          table: usersTable
        }}
      />
    </>
  );
}

export default App;
