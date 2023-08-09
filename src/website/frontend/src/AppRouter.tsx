import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline, responsiveFontSizes } from "@mui/material";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/store";

export const AppRouter = (props: any) => {
  const defaultTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  const theme = responsiveFontSizes(defaultTheme, {
    factor: 2,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  );
};
