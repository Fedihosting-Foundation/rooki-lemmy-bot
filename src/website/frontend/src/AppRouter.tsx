import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/store";

export const AppRouter = (props: any) => {
  const theme = createTheme({});
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  );
};
