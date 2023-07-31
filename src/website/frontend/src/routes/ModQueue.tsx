import { Box, Checkbox, FormControlLabel, Switch } from "@mui/material";
import { Post } from "../components/Post";
import { useGetModqueueQuery } from "../redux/api/ModQueueAPI";
import { useState } from "react";
import { QueueEntryStatus } from "../models/IModeQueueEntry";

export const ModQueue = () => {
  const {data: modQueue} = useGetModqueueQuery()

  const [showOnlyOpenTasks, setShowOnlyOpenTasks] = useState<boolean>(localStorage.getItem("showOnlyOpenTasks") === "true")

  const handleShowOnlyOpenTasks = (checked: boolean) => {
    setShowOnlyOpenTasks(checked)
    localStorage.setItem("showOnlyOpenTasks", String(checked))
  }

  return (
    <Box sx={{width: "100%", height: "100%"}}>
      {modQueue?.filter(x => {
        return !showOnlyOpenTasks || x.status === QueueEntryStatus.Pending
      }).map((post) => (
        <Post key={post.entry.post.id} data={post} sx={{
            width: "50%",
            marginLeft: "50%",
            transform: "translateX(-50%)",
            mb: "10px"
        }}/>
      ))}

      <Box sx={{position: "absolute", top: "10px", right: "10px"}}>
      <FormControlLabel control={<Switch  />} onChange={(ev, checked) => {
handleShowOnlyOpenTasks(checked)
      }} label="Show only Open Tasks" />
      </Box>
    </Box>
  );
};
