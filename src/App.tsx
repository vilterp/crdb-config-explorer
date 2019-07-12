import React from "react";
import { ConfigurationView } from "./views/configurationMatrix";
import { threeRegions } from "./configurations";
import "./App.css";

function App() {
  return (
    <>
      <ConfigurationView
        config={{
          formation: threeRegions,
          schema: { indexes: [], zoneConfig: null }
        }}
      />
    </>
  );
}

export default App;
