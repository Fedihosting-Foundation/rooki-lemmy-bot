import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModQueue } from "./routes/ModQueue";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { selectUser, setUser } from "./redux/reducers/AuthenticationReducer";
import Login from "./routes/Login";
import client from "./lemmyClient";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import { CommunityConfig } from "./routes/CommunityConfig";
import NavigationDrawer from "./components/NavigationDrawer";

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const currentUser = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const jwt = localStorage.getItem("jwt");
  const personid = localStorage.getItem("personid");

  if (!currentUser && jwt && personid) {
    if (jwt && personid) {
      client
        .getPersonDetails({
          auth: jwt,
          person_id: parseInt(personid),
        })
        .then((user) => {
          dispatch(setUser(user));
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  } else if (loading) {
    setLoading(false);
  }
  if (loading) return <CircularProgress sx={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  }}/>;
  return (
    <BrowserRouter>
      <Routes>
        {currentUser ? (
          <Route element={<NavigationDrawer />}>
            <Route path="/config" element={<CommunityConfig />} />
            <Route path="*" element={<ModQueue />} />
          </Route>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
