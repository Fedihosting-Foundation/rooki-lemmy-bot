import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  CardMedia,
  createFilterOptions,
  Divider,
  IconButton,
  SxProps,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import config from "../../config";
import {
  useRefreshModMessageMutation,
} from "../../redux/api/ModQueueAPI";
import LockIcon from "@mui/icons-material/Lock";
import Spotlight from "../Spotlight";
import ReactMarkdown from "react-markdown";
import RefreshIcon from "@mui/icons-material/Refresh";
import { extractInstanceFromActorId, getActorId } from "../../util/utils";
import { PostView } from "lemmy-js-client";
import LinkIcon from "@mui/icons-material/Link";
import AdminLogModel from "../../models/adminLogModel";
const filter = createFilterOptions<{
  label?: string;
  value: string;
}>();

export const AdminLogEntry = (props: {
  data: AdminLogModel<PostView>;
  sx?: SxProps;
  onAction: (id: string) => void;
  hidePicture: boolean;
}) => {
  const [refresh, { isLoading }] = useRefreshModMessageMutation();

  const deleted = props.data.entry.post.deleted || false;
  const removed = props.data.entry.post.removed || false;

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
          <Box>
            <IconButton
              onClick={async (ev) => {
                ev.stopPropagation();
                const text =
                  window.location.href + "adminqueue/" + props.data.id;

                if ("clipboard" in navigator) {
                  await navigator.clipboard.writeText(text);
                } else {
                  document.execCommand("copy", true, text);
                }
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
                textDecoration: deleted || removed ? "line-through" : "none",
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
              {props.data.entry.post.name}
            </Typography>
            {props.data.entry.post.locked ? (
              <LockIcon sx={{ color: "red", alignSelf: "center" }} />
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
              posted in{" "}
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
      {props.data.entry.post.thumbnail_url ? (
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Spotlight>
            <CardMedia
              component="img"
              image={props.data.entry.post.thumbnail_url}
              alt="Thumbnail Url"
            />
          </Spotlight>
        </Box>
      ) : (
        <></>
      )}
      <Box sx={{ pl: "25px", pt: "10px" }}>
        {props.data.entry.post.thumbnail_url || props.data.entry.post.url ? (
          <>
            <Button
              sx={{ mb: 1 }}
              onClick={() => {
                window.open(
                  props.data.entry.post.thumbnail_url ||
                    props.data.entry.post.url,
                  "_blank"
                );
              }}
            >
              URL:{" "}
              {props.data.entry.post.thumbnail_url || props.data.entry.post.url}
            </Button>
            <Divider />
          </>
        ) : (
          <></>
        )}
        {props.data.entry.post.body ? (
          <Box>
            <ReactMarkdown children={props.data.entry.post.body} />
          </Box>
        ) : (
          <></>
        )}
        <Typography variant="h3">Reason: {props.data.reason}</Typography>
        <Box
          sx={{
            mt: 2,
            mb: 1,
          }}
        >
          {props.data.predictions.map((x) => {
            return (
              <Typography sx={{ mb: 1 }} key={x.className}>
                {x.className}: {Math.round(x.probability * 100)}%
              </Typography>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
};
