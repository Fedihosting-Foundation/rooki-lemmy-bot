import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import MenuIcon from "@mui/icons-material/Menu";
import { logoutUser } from "../redux/reducers/AuthenticationReducer";
import { useAppDispatch } from "../redux/hooks";

const NavigationDrawer = (props: any) => {
  const dispatch = useAppDispatch();

  const [state, setState] = useState<boolean>(false);
  const toggleDrawer = (state: boolean) => {
    setState(state);
  };

  const navigate = useNavigate();

  const options = [
    {
      name: "Home",
      icon: <HomeIcon />,
      path: "/",
    },
    {
      name: "Config",
      icon: <BuildIcon />,
      path: "/config",
    },
  ];

  return (
    <>
      <Drawer anchor={"left"} open={state} onClose={() => toggleDrawer(false)}>
        {options.map((x) => (
          <Box
            key={x.name}
            sx={{
              width: "auto",
              minWidth: "250px",
              mr: "10px",
              ml: "10px",
            }}
            role="presentation"
            onClick={() => toggleDrawer(false)}
            onKeyDown={() => toggleDrawer(false)}
          >
            <List>
              <ListItem key={x.name} disablePadding>
                <ListItemButton
                  onClick={() => {
                    toggleDrawer(false);
                    navigate(x.path);
                  }}
                >
                  <ListItemIcon>{x.icon}</ListItemIcon>
                  <ListItemText primary={x.name} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        ))}
        <Divider />
        <Button
          sx={{
            mt: "10px",
            mr: "10px",
            ml: "10px",
          }}
          variant="outlined"
          onClick={() => {
            console.log("logout");
            dispatch(logoutUser());
          }}
        >
          Logout
        </Button>
      </Drawer>
      <Button
        sx={{
          position: "fixed",
          minWidth: "0px",
          m: "10px",
        }}
        size="small"
        variant="contained"
        color="primary"
        onClick={() => toggleDrawer(true)}
      >
        {<MenuIcon />}
      </Button>
      <Outlet />
    </>
  );
};

export default NavigationDrawer;
