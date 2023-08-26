import {
  Comment,
  Community,
  GetPersonDetails,
  GetPersonDetailsResponse,
  Person,
  Post,
} from "lemmy-js-client";
import { useGetPersonQuery } from "../../redux/api/UtilApi";
import { LegacyRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { extractInstanceFromActorId, getActorId } from "../../util/utils";
import * as d3 from "d3";
import { Box } from "@mui/material";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: any;
  target: any;
  size?: number;
  label?: string;
  length?: number;
  color?: string;
}

const getInstanceNode = (instance: string): Node => {
  return {
    id: "instance-" + instance,
    label: "Instance: " + instance,
  };
};

const getPostNode = (post: Post) => {
  return {
    id: "post-" + post.id,
    label: "Post: " + post.name,
  };
};

const getCommentNode = (comment: Comment) => {
  return {
    id: "comment-" + comment.id,
    label: "Comment",
  };
};

const getData = async (data: GetPersonDetailsResponse) => {
  const isLocal = data.person_view.person.local;

  const links: Link[] = [];

  const instanceNodes: Node[] = [];
  const communityNodes: Node[] = [];
  const userInstance = extractInstanceFromActorId(
    data.person_view.person.actor_id
  );
  const userId = getActorId(userInstance, data.person_view.person.name);
  const userNode: Node = {
    id: "user-" + data.person_view.person.id,
    label: userId,
  };

  const userInstanceNode: Node = getInstanceNode(userInstance);

  instanceNodes.push(userInstanceNode);

  links.push({
    source: userNode.id,
    target: userInstanceNode.id,
  });

  const createdCommunityNodes = (community: Community) => {
    const communityNode: Node = {
      id: "community-" + community.id,
      label: "c/" + community.name,
    };
    communityNodes.push(communityNode);
    const instance = extractInstanceFromActorId(community.actor_id);

    let instanceNode: Node | undefined = instanceNodes.find(
      (i) => i.id === "instance-" + instance
    );
    if (!instanceNode) {
      instanceNode = getInstanceNode(instance);
      instanceNodes.push(instanceNode);
      links.push({
        source: userInstanceNode.id,
        target: instanceNode.id,
      })
    }

    links.push({
      source: instanceNode.id,
      target: communityNode.id,
    });
    return communityNode;
  };

  const postNodes: Node[] = data.posts.map((post) => {
    const p = post.post;
    let communityNode: Node | undefined = communityNodes.find((c) => c.id === "community-" + p.community_id)
    if (!communityNode) {
       communityNode = createdCommunityNodes(post.community);
    }

    const postNode: Node = getPostNode(p);

    links.push({
      source: communityNode.id,
      target: postNode.id,
    });
    return postNode;
  });

  const commentNodes: Node[] = data.comments.map((comment) => {
    const c = comment.comment;
    const p = comment.post;

    if (!postNodes.find((p) => p.id === "post-" + c.post_id)) {
        const postNode = getPostNode(p);
      postNodes.push(postNode);
      let communityNode: Node | undefined = communityNodes.find((c) => c.id === "community-" + p.community_id)
  
      if (!communityNode) {
        communityNode = createdCommunityNodes(comment.community);
      }
      links.push({
        source: communityNode.id,
        target: postNode.id,
    })
    }
    const commentNode: Node = getCommentNode(c);

    links.push({
      source: String("post-" + p.id),
      target: commentNode.id,
    });
    return commentNode;
  });

  const nodes = [
    userNode,
    ...commentNodes,
    ...postNodes,
    ...communityNodes,
    ...instanceNodes,
  ];
  return { nodes, links };
};
// svg.call(d3.zoom()
//     .scaleExtent([0.1, 10])
//     .on("zoom", function(event, d) {
//         g.attr("transform", event.transform);
//     }));
export const D3Chart = (props: { person: Person }) => {
  const height = 500;
  const width = 500;
  const chartTimeout = useRef<NodeJS.Timeout | undefined>();
  const {
    data: user,
    isLoading,
    isFetching,
  } = useGetPersonQuery(
    {
      userId: props.person.id,
    },
    {
      pollingInterval: 15 * 60 * 1000,
    }
  );
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const chartRef = useRef<SVGSVGElement>();
  const doChart = (data: {links: Link[], nodes: Node[]}) => {
    if (!chartRef.current) return;

    const links = [...data.links.map((d) => ({ ...d }))];
    const nodes = [...data.nodes.map((d) => ({ ...d }))];
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink<Node, Link>(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody())
      .force(
        "center",
        d3.forceCenter(
          chartRef.current.getBBox().width / 2,
          chartRef.current.getBBox().height / 2
        )
      );
    const svg = d3
      .select(chartRef.current)
      .attr("viewBox", [
        0,
        0,
        chartRef.current.getBBox().width,
        chartRef.current.getBBox().height,
      ]);
    svg.selectAll("*").remove();
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll()
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.size ?? 1));
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll()
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => color(d.color ? d.color : "#000"));

    const ticked = () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);
      texts.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    };
    simulation.on("tick", ticked);
    // Unfix the subject position now that it’s no longer being dragged.
    node.call(
      d3
        .drag<any, any>()
        .on("start", function (event: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", function (event: any) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", function (event: any, ...args: any[]) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        })
    );
    var texts = svg
      .selectAll("text.label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dy", "-10px")
      .attr("font-size", "5px")
      .attr("cursor", "default")
      .attr("pointer-events", "none")
      .attr("user-select", "none")
      .text(function (d) {
        return d.label;
      });
  }
  useEffect(() => {
    if (user) {
      getData(user)
        .then((data) => {
          if (chartRef.current) {
            if (chartTimeout.current) {
              clearTimeout(chartTimeout.current);
              chartTimeout.current = undefined;
            }
            chartTimeout.current = setTimeout(() => doChart(data), 2000);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user]);

  return (
    <svg
      ref={(d) => (chartRef.current = d || undefined)}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};
