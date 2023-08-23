import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline, responsiveFontSizes } from "@mui/material";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/store";

export const AppRouter = (props: any) => {
  const defaultTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: "#006bb3",
      },
        contrastThreshold: 5,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: "#3a5f7850",
          }
        }
      }
    }
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
