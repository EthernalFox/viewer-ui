import { AppRouterProvider, ThemeProvider } from "./providers";

const App = () => {
  return (
    <ThemeProvider>
      <AppRouterProvider />
    </ThemeProvider>
  );
};

export default App;
