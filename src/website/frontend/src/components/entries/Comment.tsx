import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  SxProps,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { useState } from "react";
import config from "../../config";
import { extractInstanceFromActorId, getActorId } from "../../util/utils";
import { Comment, Community, Post } from "lemmy-js-client";
import { useGetPersonQuery } from "../../redux/api/UtilApi";
import ReactMarkdown from "react-markdown";

export const CommentCard = (props: {
  data: { entry: Comment, parent: Post, community: Community };
  sx?: SxProps;
  elevation?: number;
}) => {
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const {data:Creator, isLoading} = useGetPersonQuery({userId: props.data.entry.creator_id})
  if(isLoading || !Creator) return (<Card sx={{ ...props.sx }}>
  <div>Loading...</div>
  </Card>)

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
              src={!hoverAvatar ? Creator?.person_view.person.avatar : undefined}
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
                textDecorationColor: "red",
                textDecorationThickness: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                window.open(
                  `${config.instance}comment/${props.data.entry.id}`,
                  "_blank"
                );
              }}
              variant="h4"
            >
              Comment:
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
                  `${config.instance}u/${Creator?.person_view.person.local
                    ? Creator?.person_view.person.name
                    : getActorId(
                        extractInstanceFromActorId(
                          Creator?.person_view.person.actor_id
                        ),
                        Creator?.person_view.person.name
                      )}`,
                  "_blank"
                );
              }}
              sx={{
                cursor: "pointer",
              }}
              variant="body1"
            >
              {Creator?.person_view.person.local
                ? Creator?.person_view.person.name
                : getActorId(
                    extractInstanceFromActorId(
                      Creator?.person_view.person.actor_id
                    ),
                    Creator?.person_view.person.name
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
                  `${config.instance}comment/${props.data.entry.id}`,
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
                      extractInstanceFromActorId(
                        props.data.community.actor_id
                      ),
                      props.data.community.name
                    )}
              </b>
            </Typography>
            <Typography
              sx={{
                cursor: "pointer",
                ml: "5px",
                alignSelf: "center",
              }}
              onClick={() => {
                window.open(
                  `${config.instance}post/${props.data.entry.post_id}`,
                  "_blank"
                );
              }}
              variant="body2"
            >
              under the post <b>{props.data.parent.name}</b>
            </Typography>
          </Box>
        }
      />
       <CardContent>
          <ReactMarkdown  children={props.data.entry.content} />
        </CardContent>
    </Card>
  );
};
