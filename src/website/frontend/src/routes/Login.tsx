import {
  Alert,
  AlertProps,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import client from "../lemmyClient";
import { useAppDispatch } from "../redux/hooks";
import { setUser } from "../redux/reducers/AuthenticationReducer";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [mfa, setMfa] = useState<string | undefined>();
  const dispatch = useAppDispatch();
  const [alert, setAlert] = useState<
    (AlertProps & { alertContent?: string }) | null
  >(null);

  const login = async () => {
    if( !username || !password) {
      setAlert({
        severity: "error",
        alertContent: "Please fill out all fields",
      });
      return;
    };

    try {
      const response = await client.login({
        password: password,
        username_or_email: username,
        totp_2fa_token: mfa,
      });
      if (!response || !response.jwt) {
        setAlert({
          severity: "error",
          alertContent:
            "Login failed ( Email/Username, Password or not verification incorrect or incomplete )",
        });
        return;
      }
      localStorage.setItem("jwt", response.jwt);
      const site = await client.getSite({
        auth: response.jwt,
      });

      if (!site.my_user) {
        setAlert({
          severity: "error",
          alertContent:
            "Login failed ( Email/Username, Password or not verification incorrect or incomplete )",
        });

        return};

      localStorage.setItem(
        "personid",
        String(site.my_user.local_user_view.person.id)
      );
      const user = await client?.getPersonDetails({
        auth: response.jwt,
        person_id: site.my_user.local_user_view.person.id,
      });
      if(!user){
        setAlert({
          severity: "error",
          alertContent: "User not found.",
        });
        return;
      }
      dispatch(setUser(user));
    } catch (e: any) {
      console.log(e);
      if (e === "incorrect_login") {
        setAlert({
          severity: "error",
          alertContent: "Login failed ( Email/Username or Password incorrect )",
        });
        return;
      }
      setAlert({
        severity: "error",
        alertContent: "Login failed",
      });
    }
  };

  return (
    <Container
      sx={{
        textAlign: "center",
      }}
    >
      <Typography variant="h1">Login</Typography>
      <Grid
        sx={{
          width: "100%",
        }}
        mt={2}
        spacing={2}
        container
      >
        <Grid xs={12} item>
          <TextField
            onChange={(ev) => {
              setUsername(ev.target.value);
            }}
            label="Username/Email:"
          ></TextField>
        </Grid>
        <Grid xs={12} item>
          <TextField
            onChange={(ev) => {
              setPassword(ev.target.value);
            }}
            label="Password:"
            type="password"
          ></TextField>
        </Grid>
        <Grid xs={12} item>
          <TextField
            onChange={(ev) => {
              setMfa(ev.target.value);
            }}
            label="2FA:"
            type="password"
          ></TextField>
        </Grid>
        <Grid xs={12} item>
          <Button>
            <Typography onClick={login}>Login</Typography>
          </Button>
        </Grid>
        <Grid ml={"25%"} xs={6} item>
          {alert ? <Alert {...alert}>{alert.alertContent}</Alert> : <></>}
        </Grid>
      </Grid>
    </Container>
  );
}
