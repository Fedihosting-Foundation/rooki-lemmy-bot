import { Box, Button, FormControlLabel, Switch } from "@mui/material";
import { useGetModqueueQuery } from "../redux/api/ModQueueAPI";
import { useEffect, useState } from "react";
import IModQueueEntry, {
  IModQueueUtils,
  QueueEntryStatus,
  allowedEntries,
} from "../models/IModeQueueEntry";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectSpotlight,
  setSpotlight,
} from "../redux/reducers/SettingsReducer";
import { useWindowSize } from "../util/utils";
import { PostEntry } from "../components/entries/PostEntry";
import { ReportEntry } from "../components/entries/ReportEntry";
import { CommentReportView, PostReportView, PostView } from "lemmy-js-client";

export const ModQueue = () => {
  const dispatch = useAppDispatch();
  const { data: modQueue } = useGetModqueueQuery(undefined, {
    pollingInterval: 1 * 60 * 1000,
  });
  const spotlight = useAppSelector(selectSpotlight);
  const [showOnlyOpenTasks, setShowOnlyOpenTasks] = useState<boolean>(
    localStorage.getItem("showOnlyOpenTasks") === "true"
  );

  const [modData, setModData] = useState<IModQueueEntry<allowedEntries>[]>([]);
  const [h, setH] = useState<number>(25);
  const [oldH, setOldH] = useState<number>(0);
  const [lastScroll, setLastScroll] = useState<number>(0);
  const handleScroll = (e: any) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <=
      e.target.clientHeight + 1500;

    if (
      bottom &&
      modQueue &&
      modQueue.length >= h &&
      lastScroll <= Date.now()
    ) {
      setH(h + 25);
      setLastScroll(Date.now() + 500);
    }
  };

  useEffect(() => {
    if (!modQueue) return;
    let newH = h;
    let data = [...modQueue];
    if (oldH !== 0 && oldH !== modQueue.length) {
      newH += modQueue.length - oldH;
    }
    setOldH(modQueue.length);

    data.reverse();

    data = data.filter((x) => {
      return !showOnlyOpenTasks || !IModQueueUtils.isDone(x)
    });

    if (data.length < newH) newH = data.length;
    data.length = newH;
    data = data.slice(0, newH);
    if (data) {
      setModData(data);
    }
  }, [modQueue, h, showOnlyOpenTasks]);

  const [width, height] = useWindowSize();

  const handleShowOnlyOpenTasks = (checked: boolean) => {
    setShowOnlyOpenTasks(checked);
    localStorage.setItem("showOnlyOpenTasks", String(checked));
  };

  const [props, setProps] = useState<any>({});

  useEffect(() => {
    if (width < 800) {
      setProps({ width: "100%", ml: "0" });
    } else if (width < 1200) {
      setProps({ width: "75%", ml: 75 / 2 + "%" });
    } else {
      setProps({ width: "50%", ml: "50%" });
    }
  }, [width]);
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        scrollBehavior: "smooth",
        overflowY: "scroll",
      }}
      onScroll={handleScroll}
    >
      {modData ? (
        [...modData].map((entry) =>
          !("post_report" in entry.entry) &&
          !("comment_report" in entry.entry) ? (
            <PostEntry
              key={"PostEntry" +entry.entry.post.id}
              data={entry as IModQueueEntry<PostView>}
              sx={{
                ...props,
                transform: `translateX(-${
                  props?.ml.replace("%", "") || "50"
                }% )`,
                mb: "10px",
              }}
            />
          ) : (
            <ReportEntry
              key={"ReportEntry" + ("post_report" in entry.entry ? entry.entry.post_report.id : entry.entry.comment_report.id) + ("post_report" in entry.entry ? "post_report" : "comment_report")}
              data={entry as IModQueueEntry<CommentReportView | PostReportView>}
              sx={{
                ...props,
                transform: `translateX(-${
                  props?.ml.replace("%", "") || "50"
                }% )`,
                mb: "10px",
              }}
            />
          )
        )
      ) : (
        <></>
      )}
      {modData.length !== (modQueue?.length || 0) ? (
        <Box
          sx={{
            width: "100%",
          }}
        >
          <Button
            sx={{
              ml: "50%",
              transform: "translateX(-50%)",
              width: "50%",
              mb: "10px",
            }}
            onClick={() => {
              setH(h + 20);
            }}
          >
            Load More
          </Button>
        </Box>
      ) : (
        <></>
      )}
      <Box
        sx={{
          position: "fixed",
          display: "inline-flex",
          flexDirection: "row",
          flexWrap: "wrap",
          top: "5px",
          right: "5px",
          p: "5px",
          maxWidth: width > 1500 ? "100%" : "250px",
          borderRadius: "10px",
          backgroundColor: "rgba(0,0,0,0.75)",
        }}
      >
        <FormControlLabel
          control={<Switch />}
          onChange={(ev, checked) => {
            handleShowOnlyOpenTasks(checked);
          }}
          checked={showOnlyOpenTasks}
          label="Show only Open Tasks"
        />

        <FormControlLabel
          control={<Switch />}
          onChange={(ev, checked) => {
            dispatch(setSpotlight(checked));
          }}
          checked={spotlight}
          label="Enable Spotlight"
        />
      </Box>
    </Box>
  );
};
