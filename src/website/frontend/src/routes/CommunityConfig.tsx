import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItem,
  MenuItem,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import {
  extractInstanceFromActorId,
  getActorId,
  isAdmin,
  useWindowSize,
} from "../util/utils";
import { useEffect, useState } from "react";
import ModQueueConfig from "../components/config/ModQueueConfig";
import {
  useAddCommunityMutation,
  useGetAllModConfigQuery,
} from "../redux/api/ModConfigApi";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setCurrentCommunity } from "../redux/reducers/CommunitySettingsReducer";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { selectUser } from "../redux/reducers/AuthenticationReducer";
import SiteConfig from "../components/config/SiteConfig";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const CommunityConfig = () => {
  const [width] = useWindowSize();
  const [props, setProps] = useState<any>({});
  const [newCommunity, setNewCommunity] = useState<number>();
  const currentUser = useAppSelector(selectUser);
  const [addCommunityDialogOpen, setAddCommunityDialogeOpen] =
    useState<boolean>(false);
  const [tab, setTab] = useState(0);
  const { data } = useGetAllModConfigQuery();
  const [addCommunity] = useAddCommunityMutation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (width < 800) {
      setProps({ width: "100%", ml: "0" });
    } else if (width < 1200) {
      setProps({ width: "75%", ml: 75 / 2 + "%" });
    } else {
      setProps({ width: "50%", ml: "50%" });
    }
  }, [width]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  if (!currentUser) return <div>Not Logged In</div>;

  return (
    <Box
      sx={{
        ...props,
        transform: "translate(-50%, 0)",
        pt: 2,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "flex" }}>
          <Autocomplete
            id="community-select"
            options={data?.communities || []}
            sx={{ width: 300 }}
            onChange={(_, newVal) => {
              console.log(newVal);
              dispatch(setCurrentCommunity(newVal || undefined));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                value={{
                  params,
                }}
                label="Selected Community"
              />
            )}
            getOptionLabel={(option) => {
              return option.community.name;
            }}
            renderOption={(props, option) => {
              return <MenuItem {...props}>{option.community.name}</MenuItem>;
            }}
          />
          <IconButton
            onClick={() => setAddCommunityDialogeOpen(!addCommunityDialogOpen)}
          >
            {<AddCircleIcon />}
          </IconButton>
        </Box>
        <Tabs value={tab} onChange={handleChange} aria-label="basic tabs">
          <Tab label="Mod Queue" />
          <Tab label="Filters" />
          {
            isAdmin(currentUser.person_view.person)  ? (
              <Tab label="Site Config" />
            ) : []
            }
        </Tabs>
      </Box>
      <CustomTabPanel value={tab} index={0}>
        <ModQueueConfig />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        TBD
      </CustomTabPanel>
      {
        isAdmin(currentUser.person_view.person) ? (
          <CustomTabPanel value={tab} index={2}>
            <SiteConfig />
          </CustomTabPanel>
        ) : []
      }
      <Dialog
        open={addCommunityDialogOpen}
        onClose={() => setAddCommunityDialogeOpen(false)}
        fullWidth
      >
        <DialogTitle>New Community</DialogTitle>
        <DialogContent>
          <Autocomplete
            autoFocus
            id="add-community"
            options={currentUser?.moderates
              .map((c) => c.community)
              .filter(
                (c) => !data?.communities?.some((x) => x.community.id === c.id)
              )}
            fullWidth
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            sx={{ pt: 1 }}
            renderInput={(params) => (
              <TextField {...params} label="The Community:" />
            )}
            renderOption={(props, option) => (
              <ListItem {...props} key={option.id}>
                {option.name}
              </ListItem>
            )}
            onChange={(e, newValue) => {
              if (newValue?.id) setNewCommunity(newValue?.id);
            }}
            getOptionLabel={(option) => {
              return option.local
                ? option.name
                : getActorId(
                  extractInstanceFromActorId(option.actor_id),
                  option.name
                );
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCommunityDialogeOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (newCommunity) addCommunity({ communityId: newCommunity });
              setAddCommunityDialogeOpen(false);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
