import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  selectCurrentConfig,
  setCurrentCommunity,
} from "../../redux/reducers/CommunitySettingsReducer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useUpdateModConfigMutation } from "../../redux/api/ModConfigApi";
import { useLazyIsBotModeratorOfCommunityQuery } from "../../redux/api/UtilApi";

const ModQueueConfig = (props: any) => {
  const currentConfig = useAppSelector(selectCurrentConfig);
  const dispatch = useAppDispatch();
  const [update, data] = useUpdateModConfigMutation();
  const [fetchBotMod, {data:isBotMod}] = useLazyIsBotModeratorOfCommunityQuery({
    pollingInterval: 60000,
  })
  const [enabled, setEnabled] = useState<boolean>(false);
  const [type, setType] = useState<"active" | "passive">("passive");
  useEffect(() => {
    if (!currentConfig) return;
    setEnabled(currentConfig.modQueueSettings.enabled);
    setType(currentConfig.modQueueSettings.modQueueType);
  }, [currentConfig]);

  useEffect(() => {
    if (!data.data) return;
    setEnabled(data.data.modQueueSettings.enabled);
    setType(data.data.modQueueSettings.modQueueType);
    dispatch(setCurrentCommunity(data.data));
  }, [data.data, dispatch]);

  useEffect(() => {
    if (!currentConfig || type !== "active") return;
    fetchBotMod({
      communityId: currentConfig.community.id,
    })
  }, [type]);

  if (!currentConfig) return <Typography>Select a Community</Typography>;
  return (
    <Box>
      <Typography variant="h6">Mod Queue Config</Typography>

      <Box
        sx={{
          display: "flow",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              onChange={(ev, checked) => {
                setEnabled(checked);
              }}
              checked={enabled}
            />
          }
          label="Enabled"
          sx={{
            width: "100%",
          }}
        />
        <FormControl variant="filled" sx={{ mt: 2, width: "100%" }}>
          <InputLabel id="demo-simple-select-filled-label">Type</InputLabel>
          <Select
            onChange={(ev, child) => {
              setType(ev.target.value as "passive" | "active");
            }}
            value={type}
            label="Type"
          >
            <MenuItem value="passive">Passive</MenuItem>
            <MenuItem value="active">Active</MenuItem>
          </Select>
        </FormControl>
        {(type === "active" && !isBotMod) ? (<Alert severity="error">The bot is not a moderator of the community! (You can get to comment somwhere if you ping him! [!automodbeta@lemmy.world])</Alert>) : <></>}
      </Box>
      <Button
        sx={{
          mt: 2,
        }}
        onClick={() => {
          if (!currentConfig) return;
          update({
            community: currentConfig.community,
            modQueueSettings: {
              enabled: enabled,
              modQueueType: type,
            },
          });
        }}
      >
        Save
      </Button>
    </Box>
  );
};

export default ModQueueConfig;
