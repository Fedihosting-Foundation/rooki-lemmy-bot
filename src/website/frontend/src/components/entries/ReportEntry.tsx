import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  Collapse,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItem,
  Portal,
  Snackbar,
  SxProps,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useEffect, useState } from "react";
import IModQueueEntry, {
  IModQueueUtils,
  QueueEntryResult,
  QueueEntryStatus,
} from "../../models/IModeQueueEntry";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import config from "../../config";
import GppBadIcon from "@mui/icons-material/GppBad";
import GppGoodIcon from "@mui/icons-material/GppGood";
import {
  useAddModMessageMutation,
  useRefreshModMessageMutation,
  useUpdateModqueueMutation,
} from "../../redux/api/ModQueueAPI";
import AddCommentIcon from "@mui/icons-material/AddComment";
import Spotlight from "../Spotlight";
import ReactMarkdown from "react-markdown";
import RefreshIcon from "@mui/icons-material/Refresh";
import { extractInstanceFromActorId, getActorId } from "../../util/utils";
import ExpandMore from "../ExpandMore";
import { CommentReportView, PostReportView } from "lemmy-js-client";
import { CommentCard } from "./Comment";
import { PostCard } from "./Post";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import LinkIcon from "@mui/icons-material/Link";

const filter = createFilterOptions<{
  label?: string;
  value: string;
}>();

export const ReportEntry = (props: {
  data: IModQueueEntry<PostReportView | CommentReportView>;
  sx?: SxProps;
  onAction: (id: string) => void;
}) => {
  const [result, setResult] = useState<QueueEntryResult | undefined>();
  const [refresh, { isLoading }] = useRefreshModMessageMutation();
  const [reason, setReason] = useState<string>("");
  const [modNote, setModNote] = useState<string>("");
  const [modNoteModalOpen, setModNoteModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const isCommentReport = "comment" in props.data.entry;
  const [open, setOpen] = useState(false);

  const handleModalClickOpen = () => {
    setModalOpen(true);
  };

  const [updatePost] = useUpdateModqueueMutation();
  const [addModNote] = useAddModMessageMutation();

  const handleModalClose = (cancel: boolean) => {
    if (!cancel) {
      updatePost({
        id: props.data.id,
        result: result,
        reason: reason,
      })
        .unwrap()
        .then((res) => {
          if (res) {
            props.onAction(props.data.id);
          }
        });
      setResult(undefined);
    }
    setModalOpen(false);
  };

  const completed = props.data.status === QueueEntryStatus.Completed;
  const resolved = isCommentReport
    ? (props.data.entry as CommentReportView).comment_report.resolved
    : (props.data.entry as PostReportView).post_report.resolved;
  const [postExpanded, setPostExpanded] = useState(
    !IModQueueUtils.isResolved(props.data.entry)
  );

  useEffect(() => {
    setPostExpanded(
      props.data.status === QueueEntryStatus.Pending && !resolved
    );
  }, [props.data.status, resolved]);

  const handleUpdateClick = (res?: QueueEntryResult) => {
    setResult(res);
    handleModalClickOpen();
  };

  const handlePostExpandClick = () => {
    setPostExpanded(!postExpanded);
  };

  const [hoverAvatar, setHoverAvatar] = useState(false);

  return (
    <Card sx={{ ...props.sx }}>
      <CardHeader
        avatar={
          <Box
            onMouseEnter={() => setHoverAvatar(true)}
            onMouseLeave={() => setHoverAvatar(false)}
          >
            <Avatar
              sx={{ bgcolor: red[500] }}
              aria-label="profile-avatar"
              src={!hoverAvatar ? props.data.entry.creator.avatar : undefined}
            >
              <Box
                sx={{
                  mr: "auto",
                  position: "absolute",
                  zIndex: 999,
                }}
              >
                +
              </Box>
            </Avatar>
          </Box>
        }
        action={
          <Box>
            <IconButton
              onClick={async (ev) => {
                ev.stopPropagation();
                const text =
                  window.location.href + "modqueue/" + props.data.id;

                if ("clipboard" in navigator) {
                  await navigator.clipboard.writeText(text);
                } else {
                  document.execCommand("copy", true, text);
                }
                setOpen(true);
              }}
            >
              <LinkIcon />
            </IconButton>
            <IconButton
              disabled={isLoading}
              onClick={() => {
                refresh(props.data.id)
                  .unwrap()
                  .then(() => {
                    props.onAction(props.data.id);
                  });
              }}
            >
              <RefreshIcon />
            </IconButton>
            <ExpandMore
              expand={postExpanded}
              onClick={handlePostExpandClick}
              aria-expanded={postExpanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </Box>
        }
        title={
          <Box
            sx={{
              display: "flex",
              maxWidth: "75%",
            }}
          >
            <Typography
              sx={{
                mr: "15px",
                textDecoration: resolved ? "line-through" : "none",
                textDecorationColor: "red",
                textDecorationThickness: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                window.open(
                  `${config.instance}post/${props.data.entry.post.id}`,
                  "_blank"
                );
              }}
              variant="h4"
            >
              {isCommentReport ? "Comment Report" : "Post Report"}
            </Typography>

            {props.data.result ? (
              props.data.result === QueueEntryResult.Approved ? (
                <GppGoodIcon sx={{ color: "green", alignSelf: "center" }} />
              ) : (
                <GppBadIcon sx={{ color: "red", alignSelf: "center" }} />
              )
            ) : (
              <></>
            )}
          </Box>
        }
        subheader={
          <Box
            sx={{
              display: "inline-flex",
              flexDirection: "row",
            }}
          >
            <Typography
              onClick={() => {
                window.open(
                  `${config.instance}u/${
                    props.data.entry.creator.local
                      ? props.data.entry.creator.name
                      : getActorId(
                          extractInstanceFromActorId(
                            props.data.entry.creator.actor_id
                          ),
                          props.data.entry.creator.name
                        )
                  }`,
                  "_blank"
                );
              }}
              sx={{
                cursor: "pointer",
              }}
              variant="body1"
            >
              {props.data.entry.creator.local
                ? props.data.entry.creator.name
                : getActorId(
                    extractInstanceFromActorId(
                      props.data.entry.creator.actor_id
                    ),
                    props.data.entry.creator.name
                  )}
            </Typography>
            <Typography
              sx={{
                cursor: "pointer",
                ml: "5px",
                alignSelf: "center",
              }}
              onClick={() => {
                window.open(
                  `${config.instance}c/${
                    props.data.entry.community.local
                      ? props.data.entry.community.name
                      : getActorId(
                          extractInstanceFromActorId(
                            props.data.entry.community.actor_id
                          ),
                          props.data.entry.community.name
                        )
                  }`,
                  "_blank"
                );
              }}
              variant="body2"
            >
              reported in{" "}
              <b>
                {props.data.entry.community.local
                  ? props.data.entry.community.name
                  : getActorId(
                      extractInstanceFromActorId(
                        props.data.entry.community.actor_id
                      ),
                      props.data.entry.community.name
                    )}
              </b>
            </Typography>
          </Box>
        }
      />
      <Collapse in={postExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: "25px", pt: "10px" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
            With the reason:
          </Typography>
          <Box>
            <ReactMarkdown
              children={
                isCommentReport
                  ? (props.data.entry as CommentReportView).comment_report
                      .reason
                  : (props.data.entry as PostReportView).post_report.reason
              }
            />
          </Box>
          <Divider />

          {props.data.modNote ? (
            <Box>
              <Typography
                variant="body2"
                pt={"5px"}
                mt={2}
                color="text.primary"
              >
                Mod Notes:
              </Typography>
              {props.data.modNote.map((note) => (
                <Box key={note.note + note.person.person.id + Math.random()}>
                  <Divider />
                  <Box
                    sx={{
                      cursor: "default",
                      display: "flex",
                      mt: "10px",
                      mb: "5px",
                      wordBreak: "break-word",
                    }}
                  >
                    <Avatar src={note.person.person.avatar} />
                    <Typography
                      sx={{ pl: "10px" }}
                    >{`${note.person.person.name}: ${note.note}`}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <></>
          )}
        </Box>
        <Typography sx={{ ml: "25px" }}>Reported: </Typography>
        {isCommentReport ? (
          <CommentCard
            data={{
              entry: (props.data.entry as CommentReportView).comment,
              community: props.data.entry.community,
              parent: props.data.entry.post,
            }}
            sx={{ ml: "25px", mr: "10px", borderLeft: "5px black solid" }}
            elevation={12}
          />
        ) : (
          <PostCard
            data={{
              entry: (props.data.entry as PostReportView).post,
              community: props.data.entry.community,
            }}
            sx={{ ml: "25px", mr: "10px", borderLeft: "5px black solid" }}
            elevation={12}
          />
        )}
        <CardActions disableSpacing>
          <Tooltip
            title={`Resolve ${isCommentReport ? "Comment" : "Post"} Report`}
          >
            <span>
              <IconButton
                disabled={completed}
                onClick={() => {
                  handleUpdateClick(QueueEntryResult.Approved);
                }}
              >
                <GppGoodIcon
                  sx={{
                    color: !completed ? "green" : "white",
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Ban the User">
            <span>
              <IconButton
                disabled={completed}
                onClick={() => {
                  handleUpdateClick(QueueEntryResult.Banned);
                }}
              >
                <GppBadIcon
                  sx={{
                    color: !completed ? "red" : "white",
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Restore the Mod Queue Entry">
            <span>
              <IconButton
                disabled={!completed}
                onClick={() => {
                  handleUpdateClick();
                }}
              >
                <RotateLeftIcon
                  sx={{
                    color: !completed ? "white" : "red",
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Add a Mod Note!">
            <span>
              <IconButton
                onClick={() => {
                  setModNoteModalOpen(true);
                }}
                sx={{
                  marginLeft: "auto",
                }}
              >
                <AddCommentIcon />
              </IconButton>
            </span>
          </Tooltip>
        </CardActions>
      </Collapse>

      <Dialog open={modalOpen} onClose={() => handleModalClose(true)} fullWidth>
        <DialogTitle>Reason</DialogTitle>
        <DialogContent>
          <Autocomplete
            autoFocus
            id="reason"
            options={config.reasons.filter(
              (x) => !x.type || x.type === "Report"
            )}
            fullWidth
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            sx={{ pt: 1 }}
            renderInput={(params) => (
              <TextField {...params} label="The Reason:" />
            )}
            renderOption={(props, option) => (
              <ListItem {...props} key={option.label + option.value}>
                {option.label ?? option.value}
              </ListItem>
            )}
            onChange={(e, newValue) => {
              if (typeof newValue === "string") {
                setReason(newValue);
              } else if (newValue && newValue.value) {
                // Create a new value from the user input
                setReason(newValue.value);
              } else {
                setReason("");
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              const { inputValue } = params;
              // Suggest the creation of a new value
              const filteredData = filtered.filter((option) =>
                option.value.toLowerCase().includes(inputValue.toLowerCase())
              );
              const isExisting = filteredData.some(
                (option) => inputValue === option.value
              );
              if (inputValue !== "" && !isExisting) {
                filteredData.push({
                  label: `Use "${inputValue}"`,
                  value: `${inputValue}`,
                });
              }
              return filteredData;
            }}
            getOptionLabel={(option) => {
              return option.label ?? option.value;
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleModalClose(true)}>Cancel</Button>
          <Button onClick={() => handleModalClose(false)}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modNoteModalOpen}
        onClose={() => setModNoteModalOpen(false)}
        fullWidth
      >
        <DialogTitle>Your Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Comment"
            fullWidth
            variant="standard"
            onChange={(e) => {
              setModNote(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setModNote("");
              setModNoteModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              addModNote({
                modNote: modNote,
                id: props.data.id,
              })
                .unwrap()
                .then((res) => {
                  if (res) {
                    props.onAction(props.data.id);
                  }
                });
              setModNote("");
              setModNoteModalOpen(false);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Portal>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Alert
            onClose={() => setOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Copied the URL to the clipboard!
          </Alert>
        </Snackbar>
      </Portal>
    </Card>
  );
};
