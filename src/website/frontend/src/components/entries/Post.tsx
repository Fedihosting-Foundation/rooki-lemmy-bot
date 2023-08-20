import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  SxProps,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useState } from "react";
import config from "../../config";
import { extractInstanceFromActorId, getActorId } from "../../util/utils";
import { Community, Post } from "lemmy-js-client";
import { useGetPersonQuery } from "../../redux/api/UtilApi";
import ReactMarkdown from "react-markdown";
import Spotlight from "../Spotlight";

export const PostCard = (props: {
  data: { entry: Post; community: Community };
  sx?: SxProps;
  elevation?: number;
}) => {
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const { data: Creator, isLoading } = useGetPersonQuery({
    userId: props.data.entry.creator_id,
  });
  if (isLoading || !Creator)
    return (
      <Card sx={{ ...props.sx }}>
        <div>Loading...</div>
      </Card>
    );
  return (
    <Card sx={{ ...props.sx }} elevation={props.elevation}>
      <CardHeader
        avatar={
          <Box
            onMouseEnter={() => setHoverAvatar(true)}
            onMouseLeave={() => setHoverAvatar(false)}
          >
            <Avatar
              sx={{ bgcolor: red[500] }}
              aria-label="profile-avatar"
              src={!hoverAvatar ? Creator.person_view.person.avatar : undefined}
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
                //   textDecoration: deleted || removed ? "line-through" : "none",
                textDecorationColor: "red",
                textDecorationThickness: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                window.open(
                  `${config.instance}post/${props.data.entry.id}`,
                  "_blank"
                );
              }}
              variant="h4"
            >
              Post: {props.data.entry.name}
            </Typography>
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
                    Creator.person_view.person.local
                      ? Creator.person_view.person.name
                      : getActorId(
                          extractInstanceFromActorId(
                            Creator.person_view.person.actor_id
                          ),
                          Creator.person_view.person.name
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
              {Creator.person_view.person.local
                ? Creator.person_view.person.name
                : getActorId(
                    extractInstanceFromActorId(
                      Creator.person_view.person.actor_id
                    ),
                    Creator.person_view.person.name
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
                  `${config.instance}post/${props.data.entry.id}`,
                  "_blank"
                );
              }}
              variant="body2"
            >
              posted in{" "}
              <b>
                {props.data.community.local
                  ? props.data.community.name
                  : getActorId(
                      extractInstanceFromActorId(props.data.community.actor_id),
                      props.data.community.name
                    )}
              </b>
            </Typography>
          </Box>
        }
      />
      <CardContent>
        {props.data.entry.thumbnail_url ? (
          <Box
            sx={{
              position: "relative",
            }}
          >
            <Spotlight>
              <CardMedia
                component="img"
                image={props.data.entry.thumbnail_url}
                alt="Thumbnail Url"
              />
            </Spotlight>
          </Box>
        ) : (
          <></>
        )}
                 {props.data.entry.url ? (
            <>
              <Button
                sx={{ mb: 1 }}
                onClick={() => {
                  window.open(props.data.entry.url, "_blank");
                }}
              >
                URL: {props.data.entry.url}
              </Button>
            </>
          ) : (
            <></>
          )}

        {props.data.entry.body ? (
          <ReactMarkdown children={props.data.entry.body} />
        ) : (
          <Typography>No Body</Typography>
        )}
      </CardContent>
    </Card>
  );
};
