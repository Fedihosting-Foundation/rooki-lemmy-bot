import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGetSiteConfigQuery, useUpdateSiteConfigMutation } from "../../redux/api/SiteConfigAPI";
import { nsfwFilterThresholds } from "../../models/siteConfigModel";

const SiteConfig = (props: any) => {
  const { data: currentConfig } = useGetSiteConfigQuery(undefined, {
    pollingInterval: 60000,
  })
  const [update, data] = useUpdateSiteConfigMutation();
  const [nsfwFilter, setNSFWFilterEnabled] = useState<boolean>(false);
  const [thresholds, setThresholds] = useState<nsfwFilterThresholds>();
  const [banHour, setBanHour] = useState<number>(0);
  useEffect(() => {
    if (!currentConfig) return;
    setNSFWFilterEnabled(currentConfig.data.nsfwFilter.enabled);
    setThresholds(currentConfig.data.nsfwFilter.thresholds);
    setBanHour(currentConfig.data.nsfwFilter.banAgeHours);
  }, [currentConfig]);
  if (!currentConfig) return <Typography>Loading...</Typography>;
  return (
    <Box>
      <Typography variant="h6">Site Config</Typography>

      <Box
        sx={{
          display: "flow",
        }}
      >
        <Typography variant="subtitle1">NSFW Filter</Typography>
        <FormControlLabel
          control={
            <Checkbox
              onChange={(ev, checked) => {
                setNSFWFilterEnabled(checked);
              }}
              checked={nsfwFilter}
            />
          }
          label="Enabled"
          sx={{
            width: "100%",
          }}
        />
        {
          thresholds && ((Object.entries(thresholds) as [keyof nsfwFilterThresholds, number?][]).map(([key, value]) => {
            return (
              <Box
                key={key}
                sx={{
                  display: "flow",
                  mt: 2,
                }}
              >
                <Typography variant="subtitle1">{key}</Typography>
                <Slider value={value} onChange={(ev, newVal, active) => {
                  const newThresholds = { ...thresholds };
                  newThresholds[key] = Number(newVal) || 1;
                  console.log(newThresholds)
                  setThresholds(newThresholds);
                  console.log(newVal)
                }}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="on"
                  sx={{
                  }}
                />
                <Typography variant="subtitle1" fontSize={15} sx={{
                  mt: -1,
                  mb: 1
                }}>1 = disabled - 0 = Everything</Typography>
              </Box>
            );
          })
          )
        }
        <TextField fullWidth label="Ban rule breaking users younger than: (0 = Disabled)" variant="outlined" type="number" value={banHour} onChange={(ev) => {
          setBanHour(Number(ev.target.value));

        }} />
      </Box>
      <Button
        sx={{
          mt: 2,
        }}
        onClick={() => {
          console.log(currentConfig);
          console.log(thresholds)
          if (!currentConfig) return;
          update({
            nsfwFilter: {
              enabled: nsfwFilter,
              thresholds: thresholds ?? currentConfig.data.nsfwFilter.thresholds,
              banAgeHours: banHour,
            }
          });
        }}
      >
        Save
      </Button>
    </Box>
  );
};

export default SiteConfig;
