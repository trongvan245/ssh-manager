import { ThemeProvider } from "./components/theme-provider";
import useRouteElements from "./useRouteElements";
import { useEffect } from "react";
import { getDirPath } from "./utils/dirPath";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";

function App() {
  const routeElements = useRouteElements();

  useEffect(() => {
    const fetchData = async () => {
      const path = await appDataDir();
    };
    fetchData();
  }, []);
  useEffect(() => {
    //TODO: check pesisted scope not working
    const initApps = async () => {
      const appDirPath = await getDirPath();
      await invoke("allow_dir", { path: appDirPath });
      console.log(`Directory ${appDirPath} is now allowed.`);
    };
    initApps();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {routeElements}
    </ThemeProvider>
  );
}

export default App;
