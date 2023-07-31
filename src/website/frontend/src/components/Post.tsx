import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  IconButtonProps,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  styled,
  SxProps,
  TextField,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useEffect, useRef, useState } from "react";
import IModQueueEntry, {
  QueueEntryResult,
  QueueEntryStatus,
} from "../models/IModeQueueEntry";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import config from "../config";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import GppBadIcon from "@mui/icons-material/GppBad";
import GppGoodIcon from "@mui/icons-material/GppGood";
import {
  useAddModMessageMutation,
  useUpdateModqueueMutation,
} from "../redux/api/ModQueueAPI";
import GavelIcon from "@mui/icons-material/Gavel";
import AddCommentIcon from "@mui/icons-material/AddComment";

function checkURL(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
const filter = createFilterOptions<{
  label?: string;
  value: string;
}>();

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export const Post = (props: { data: IModQueueEntry; sx?: SxProps }) => {
  const [result, setResult] = useState<QueueEntryResult | undefined>();

  const [reason, setReason] = useState<string>("");
  const [modNote, setModNote] = useState<string>("");
  const [modNoteModalOpen, setModNoteModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalClickOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = (cancel: boolean) => {
    if (!cancel) {
      updatePost({
        postId: props.data.entry.post.id,
        result: result,
        reason: reason,
      });
      setResult(undefined);
    }
    setModalOpen(false);
  };

  const [updatePost] = useUpdateModqueueMutation();
  const [addModNote] = useAddModMessageMutation();
  const [expanded, setExpanded] = useState(false);
  const completed = props.data.status === QueueEntryStatus.Completed;

  const [postExpanded, setPostExpanded] = useState(
    props.data.status === QueueEntryStatus.Pending
  );

  useEffect(() => {
    setPostExpanded(props.data.status === QueueEntryStatus.Pending);
  }, [props.data.status]);

  const handleUpdateClick = (res?: QueueEntryResult) => {
    setResult(res);
    handleModalClickOpen();
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const handlePostExpandClick = () => {
    setPostExpanded(!postExpanded);
  };
  return (
    <Card sx={{ ...props.sx }}>
      <CardHeader
        avatar={
          <Avatar
            sx={{ bgcolor: red[500] }}
            aria-label="profile-avatar"
            src={props.data.entry.creator.avatar}
          ></Avatar>
        }
        action={
          <ExpandMore
            expand={postExpanded}
            onClick={handlePostExpandClick}
            aria-expanded={postExpanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
        title={
          <Box
            sx={{
              display: "flex",
            }}
          >
            <Typography
              sx={{
                mr: "10px",
              }}
              onClick={() => {
                window.open(
                  `${config.instance}post/${props.data.entry.post.id}`,
                  "_blank"
                );
              }}
              variant="h4"
            >
              {props.data.entry.post.name}
            </Typography>
            {props.data.result ? (
              props.data.result === QueueEntryResult.Approved ? (
                <GppGoodIcon sx={{ color: "green" }} />
              ) : (
                <GppBadIcon sx={{ color: "red" }} />
              )
            ) : (
              <></>
            )}
          </Box>
        }
        subheader={
          <Typography
            onClick={() => {
              window.open(
                `${config.instance}u/${props.data.entry.creator.name}`,
                "_blank"
              );
            }}
            sx={{
              cursor: "pointer",
            }}
            variant="body2"
          >
            {props.data.entry.creator.name}
          </Typography>
        }
      />
      <Collapse in={postExpanded} timeout="auto" unmountOnExit>
        {props.data.entry.post.thumbnail_url ? (
          <CardMedia
            component="img"
            image={props.data.entry.post.thumbnail_url}
            alt="Thumbnail Url"
          />
        ) : (
          <></>
        )}
        <Box sx={{ pl: "25px", pt: "10px" }}>
          {props.data.entry.post.url ? (
            <>
              <Button
                sx={{ mb: 1 }}
                onClick={() => {
                  window.open(props.data.entry.post.url, "_blank");
                }}
              >
                URL: {props.data.entry.post.url}
              </Button>
              <Divider />
            </>
          ) : (
            <></>
          )}
          {props.data.entry.post.body ? (
            <Typography variant="body2" color="text.secondary" mt={2} mb={2}>
              {props.data.entry.post.body}
            </Typography>
          ) : (
            <></>
          )}

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
        <CardActions disableSpacing>
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
          <IconButton
            disabled={completed}
            onClick={() => {
              handleUpdateClick(QueueEntryResult.Removed);
            }}
          >
            <GppBadIcon
              sx={{
                color: !completed ? "red" : "white",
              }}
            />
          </IconButton>
          <IconButton
            disabled={completed}
            onClick={() => {
              handleUpdateClick(QueueEntryResult.Banned);
            }}
          >
            <GavelIcon
              sx={{
                color: !completed ? "red" : "white",
              }}
            />
          </IconButton>
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
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show comments"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>TODO-COMMENTS</Typography>
          </CardContent>
        </Collapse>
      </Collapse>
      <Dialog open={modalOpen} onClose={() => handleModalClose(true)} fullWidth >
        <DialogTitle>Reason</DialogTitle>
        <DialogContent>
          <Autocomplete
            autoFocus
            id="reason"
            options={config.reasons}
            fullWidth
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            renderInput={(params) => (
              <TextField {...params} label="The Reason:" />
            )}
            renderOption={(props, option) => (
              <ListItem {...props}>{option.label ?? option.value}</ListItem>
            )}
            onChange={(e, newValue) => {
              if (typeof newValue === "string") {
                setReason(newValue);
              } else if (newValue && newValue.value) {
                // Create a new value from the user input
                setReason(newValue.value);
              } else {
                setReason(newValue?.value || "");
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              const { inputValue } = params;
              // Suggest the creation of a new value
              const isExisting = options.some(
                (option) => inputValue === option.value
              );
              if (inputValue !== "" && !isExisting) {
                filtered.push({
                  label: `Use "${inputValue}"`,
                  value: `${inputValue}`,
                });
              }

              return filtered;
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
                postId: props.data.entry.post.id,
              });
              setModNote("");
              setModNoteModalOpen(false);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
