import { Box } from "@mui/material";
import { useRef, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import { selectSpotlight } from "../redux/reducers/SettingsReducer";

const Spotlight = (props: any) => {
  const spotlight = useAppSelector(selectSpotlight);

  const divRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  async function handleMouseMove(e: any) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (divRef.current === null) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top + 20 });
  }

  return (
    <Box
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setFocus(true)}
      onMouseLeave={() => setFocus(false)}
      onClick={() => setVisible(!visible)}
    >
      <Box
        sx={{
          position: "absolute",
          top: "0",
          left: "0",
          opacity: spotlight ? (visible ? "0" : "1") : "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: focus
            ? `radial-gradient(circle at ${position.x}px ${position.y}px, #00000000 10px, #000000 250px)`
            : "black",
        }}
      />

      {props.children}
    </Box>
  );
};

export default Spotlight;
