import { Community, Person } from "lemmy-js-client";
import { useEffect, useState } from "react";
import { extractInstanceFromActorId, getActorId } from "../../util/utils";
import { asyncForEach } from "../../util/AsyncForeach";
import { useGetPersonQuery } from "../../redux/api/UtilApi";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { MultiDirectedGraph } from "graphology";
import { Attributes } from "graphology-types";
import NodeProgramBorder from "../../util/CustomRenderer";
import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import client from "../../lemmyClient";
import config from "../../config";
interface Link {
  id: string;
  source: string;
  target: string;
  color?: string;
  size?: number;
  length?: number;
}

interface Node extends Attributes {
  x: number;
  y: number;
  id: string;
  label?: string;
  color?: string;
  size?: number;
}
function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const LoadGraph = (props: { data: { creator: Person } }) => {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const instanceSize = 7,
    communitySize = 6,
    postSize = 5,
    commentSize = 4,
    selfIncrease = 2;
  const selfColor = "#ff0000",
    instanceConnection = "#00ff00";

  const holdTimeout: number = 0;

  const handleNodeClick = (event: any) => {
    event.preventSigmaDefault();
    const node = event.node;
    const nodeData = sigma.getGraph().getNodeAttributes(node);
    console.log(nodeData);
    if (nodeData.community) {
      window.open(config.instance + "c/" + nodeData.community.name, "_blank");
      return;
    }

    const splitted = nodeData.id.split("-");
    const type = splitted[0];
    if (nodeData.id === "user-source") {
      window.open(config.instance + "u/" + nodeData.label, "_blank");
      return;
    } else if (type === "instance") {
      window.open("https://" + splitted[1], "_blank");
    } else if (type === "post") {
      window.open(config.instance + "post/" + splitted[1], "_blank");
    } else if (type === "comment") {
      window.open(config.instance + "comment/" + splitted[1], "_blank");
    }
  };
  useEffect(() => {
    // Register the events
    registerEvents({
      doubleClickNode: (e) => {
        handleNodeClick(e);
      },
      downNode: (e) => {
        setDraggedNode(e.node);
        sigma.getGraph().setNodeAttribute(e.node, "highlighted", true);
        sigma.getGraph().setNodeAttribute(e.node, "fixed", true);
      },
      mouseup: (e) => {
        if (draggedNode) {
          setDraggedNode(null);
          sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
        }
      },
      mousedown: (e) => {
        // Disable the autoscale at the first down interaction
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      },
      mousemove: (e) => {
        if (draggedNode) {
          // Get new position of node
          const pos = sigma.viewportToGraph(e);
          sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
          sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

          // Prevent sigma to move camera:
          e.preventSigmaDefault();
          e.original.preventDefault();
          e.original.stopPropagation();
        }
      },
      touchup: (e) => {
        if (draggedNode) {
          setDraggedNode(null);
          sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
        }
      },
      touchdown: (e) => {
        // Disable the autoscale at the first down interaction
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      },
      touchmove: (e) => {
        if (draggedNode) {
          // Get new position of node
          const pos = sigma.viewportToGraph(e.touches[0]);
          sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
          sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

          // Prevent sigma to move camera:
          e.original.preventDefault();
          e.original.stopPropagation();
        }
      },
    });
  }, [registerEvents, sigma, draggedNode]);

  const {
    data: user,
    isLoading,
    isFetching,
  } = useGetPersonQuery(
    {
      userId: props.data.creator.id,
    },
    {
      pollingInterval: 15 * 60 * 1000,
    }
  );
  useEffect(() => {
    if (isLoading || isFetching || !user) return;
    const graph = new MultiDirectedGraph();
    const instanceNodes: {
      [key: string]: Node;
    } = {};

    const communityNodes: {
      [key: string]: Node & { community: Community };
    } = {};
    const miscNodes: Node[] = [];
    const postNodes: Node[] = [];
    const commentNodes: Node[] = [];
    const newLinks: Link[] = [];

    const isLocalUser = user.person_view.person.local;
    let sourceNode: Node = {
      id: "user-source",
      label: user.person_view.person.name,
      x: 0,
      y: 0,
      size: 10,
      type: "image",
      image: user.person_view.person.avatar,
      fixed: true,
    };
    if (!isLocalUser) {
      const instance = extractInstanceFromActorId(
        user.person_view.person.actor_id
      );
      const users_instance: Node = {
        id: "instance-" + instance,
        label: instance,
        x: 0,
        y: 0,
        size: instanceSize,
        fixed: true,
      };
      const name = getActorId(instance, user.person_view.person.name);

      const userNode: Node = {
        id: "user-source",
        label: name,
        x: 25,
        y: -10,
        size: 10,
        type: "image",
        image: user.person_view.person.avatar,
        fixed: true,
      };
      graph.addNode("user-source", userNode);

      newLinks.push({
        id: "user-instance-" + userNode.id,
        source: userNode.id,
        target: users_instance.id,
        size: 5,
      });

      instanceNodes[instance] = users_instance;
      sourceNode = users_instance;

      const lemmyworldInstance = {
        id: "instance-lemmy.world",
        label: "lemmy.world",
        x: 5,
        y: -5,
        size: instanceSize,
      };

      newLinks.push({
        id: "source-instance-" + instance,
        source: sourceNode.id,
        target: users_instance.id,
        color: instanceConnection,
        size: 5,
      });

      newLinks.push({
        id: "userinstance-lwinstance-" + lemmyworldInstance.id,
        source: lemmyworldInstance.id,
        target: users_instance.id,
        color: instanceConnection,
        size: 5,
      });

      instanceNodes["lemmy.world"] = lemmyworldInstance;

      console.log("external user");
    } else {
      console.log("local user");
      graph.addNode("user-source", sourceNode);
    }

    (async () => {
      await asyncForEach(user.posts, async (post) => {
        const community = post.community;
        if (!communityNodes[community.id]) {
          communityNodes[community.id] = {
            id: "community-" + community.id,
            label: "c/" + community.name,
            community: community,
            x: randomIntFromInterval(0, 10),
            y: randomIntFromInterval(0, 10),
            size: 7,
          };
          if (!community.local) {
            const instance = extractInstanceFromActorId(community.actor_id);
            if (!instanceNodes[instance]) {
              instanceNodes[instance] = {
                id: "instance-" + instance,
                label: instance,
                x: randomIntFromInterval(0, 10),
                y: randomIntFromInterval(0, 10),
                size: instanceSize,
              };
              newLinks.push({
                id: "source-instance-" + community.id,
                source: sourceNode.id,
                target: "instance-" + instance,
                color: instanceConnection,
                size: 5,
              });
            }
            if (
              !newLinks.find(
                (link) => link.id === "source-community-" + community.id
              )
            ) {
              newLinks.push({
                id: "instance-community-" + community.id,
                source: "instance-" + instance,
                target: "community-" + community.id,
              });
            }
          } else {
            if (
              !newLinks.find(
                (link) => link.id === "source-community-" + community.id
              )
            ) {
              if (!isLocalUser) {
                newLinks.push({
                  id: "source-community-" + community.id,
                  source: "instance-lemmy.world",
                  target: "community-" + community.id,
                });
              } else {
                newLinks.push({
                  id: "source-community-" + community.id,
                  source: sourceNode.id,
                  target: "community-" + community.id,
                });
              }
            }
          }
        }

        const postNode: Node = {
          id: "post-" + post.post.id,
          label: "Post: " + post.post.name,
          color:
            post.post.creator_id === post.creator.id ? "#ff0000" : "#000000",
          x: randomIntFromInterval(0, 10),
          y: randomIntFromInterval(0, 10),
          size: postSize,
        };

        postNodes.push(postNode);
        newLinks.push({
          id: "community-post-" + post.post.id,
          source: "community-" + community.id,
          target: "post-" + post.post.id,
        });
      });
      await asyncForEach(user.comments, async (comment) => {
        const community = comment.community;
        if (!communityNodes[community.id]) {
          communityNodes[community.id] = {
            id: "community-" + community.id,
            label: "c/" + community.name,
            community: community,
            x: randomIntFromInterval(0, 10),
            y: randomIntFromInterval(0, 10),
            size: communitySize,
          };
          if (!community.local) {
            const instance = extractInstanceFromActorId(community.actor_id);
            if (!instanceNodes[instance]) {
              instanceNodes[instance] = {
                id: "instance-" + instance,
                label: instance,
                x: randomIntFromInterval(0, 10),
                y: randomIntFromInterval(0, 10),
                size: instanceSize,
              };
              newLinks.push({
                id: "source-instance-" + community.id,
                source: sourceNode.id,
                target: "instance-" + instance,
                color: instanceConnection,
                size: 5,
              });
            }
            if (
              !newLinks.find(
                (link) => link.id === "source-community-" + community.id
              )
            ) {
              newLinks.push({
                id: "instance-community-" + community.id,
                source: "instance-" + instance,
                target: "community-" + community.id,
              });
            }
          } else {
            if (
              !newLinks.find(
                (link) => link.id === "source-community-" + community.id
              )
            ) {
              if (!isLocalUser) {
                newLinks.push({
                  id: "source-community-" + community.id,
                  source: "instance-lemmy.world",
                  target: "community-" + community.id,
                });
              } else {
                newLinks.push({
                  id: "source-community-" + community.id,
                  source: sourceNode.id,
                  target: "community-" + community.id,
                });
              }
            }
          }
        }

        const commentNode: Node = {
          id: "comment-" + comment.comment.id,
          label: "Comment",
          x: randomIntFromInterval(0, 10),
          y: randomIntFromInterval(0, 10),
          size: commentSize,
          color: selfColor,
        };
        commentNodes.push(commentNode);

        const postNode = postNodes.find((postNode) => {
          return postNode.id === "post-" + comment.comment.post_id;
        });
        if (!postNode) {
          const postNode: Node = {
            id: "post-" + comment.post.id,
            label: "Post: " + comment.post.name,
            color:
              comment.post.creator_id === user.person_view.person.id
                ? selfColor
                : "#000000",
            x: randomIntFromInterval(0, 10),
            y: randomIntFromInterval(0, 10),
            size:
              comment.post.creator_id === user.person_view.person.id
                ? postSize + selfIncrease
                : postSize,
          };

          postNodes.push(postNode);

          newLinks.push({
            id: "community-post-" + comment.post.id,
            source: "community-" + community.id,
            target: "post-" + comment.post.id,
          });
        }
        newLinks.push({
          id: "post-comment-" + comment.comment.id,
          source: "post-" + comment.comment.post_id,
          target: "comment-" + comment.comment.id,
        });
      });

      Object.values(instanceNodes).forEach((node) => {
        graph.addNode(node.id, node);
      });

      Object.values(communityNodes).forEach((node) => {
        graph.addNode(node.id, node);
      });

      postNodes.forEach((node) => {
        graph.addNode(node.id, node);
      });

      commentNodes.forEach((node) => {
        graph.addNode(node.id, node);
      });

      miscNodes.forEach((node) => {
        graph.addNode(node.id, node);
      });

      newLinks.forEach((link) => {
        graph.addEdgeWithKey(link.id, link.source, link.target, {
          ...link,
        });
      });

      loadGraph(graph);
      const layout = new FA2Layout(sigma.getGraph(), {
        getEdgeWeight: 1,
        settings: {
          barnesHutOptimize: true,
          slowDown: 50 + Math.log(1000),
          edgeWeightInfluence: 0.25,
          gravity: 0.25,
          linLogMode: true,
          strongGravityMode: false,
        },
      });
      if (layout.isRunning()) {
        return;
      }
      layout.start();
      setTimeout(() => {
        layout.stop();
      }, 5000);
    })();
  }, [isFetching, isLoading, sigma, user]);
  return null;
};

export const Chart = (props: { data: { creator: Person } }) => {
  return (
    <SigmaContainer
      settings={{
        defaultNodeType: "border",
        hideEdgesOnMove: true,
        hideLabelsOnMove: true,
        labelRenderedSizeThreshold: 0.5,
        nodeProgramClasses: {
          border: NodeProgramBorder,
          image: getNodeProgramImage(),
        },
      }}
      style={{ height: "500px", width: "100%" }}
    >
      <LoadGraph data={props.data} />
    </SigmaContainer>
  );
};
