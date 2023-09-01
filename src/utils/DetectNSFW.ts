import axios from "axios";
import * as tfnode from "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs-node";
import * as nsfwjs from "nsfwjs";
import sharp from "sharp";
import path from "path";
import fs from "fs";
const model_fp = "file://" +  path.join(__dirname, "../../nsfwjs/model.json");
let nsfwlib: nsfwjs.NSFWJS;
if (process.env.DEVELOPMENT !== "true") {
  tf.enableProdMode();
  tfnode.enableProdMode();
}
function isWebp(data: Uint8Array) {
  return (
    data[0] === 0x52 &&
    data[1] === 0x49 &&
    data[2] === 0x46 &&
    data[3] === 0x46 &&
    data[8] === 0x57 &&
    data[9] === 0x45 &&
    data[10] === 0x42 &&
    data[11] === 0x50
  );
}

const specialFetch = async (url: string) => {
  let data: Uint8Array;
  if (["imgur.com", "i.imgur.com"].some((x) => url.includes(x))) {
    const splitUrl =  url.split("/")
    const id = splitUrl[splitUrl.length - 1].split(".")[0]
    data = (
      await axios.get(url, {
        responseType: "arraybuffer",
        headers: { 'User-Agent':'Axios 0.21.1', 'Authorization': `Client-ID 9ad8b61f409a8ca` },
     
      })
    ).data;
  } else {
    data = (
      await axios.get(url, {
        responseType: "arraybuffer",
      })
    ).data;
  }
  return data;
};
const nsfw = new nsfwjs.NSFWJS("", {
  size: 299
});

nsfw.load = async function() {
  this.model = (await tf.loadLayersModel(model_fp)) as any;
};
let loaded = false
async function analysePicture(url: string) {
  await tfnode.ready();
  await tf.ready();
  if (!loaded) {
    await nsfw.load();
    loaded = true
  }

  const pic = await specialFetch(url);
  let data: Uint8Array = pic;
  console.log("isWebp", isWebp(data));
  if (isWebp(data)) {
    data = await sharp(data).toFormat("png").toBuffer();
  }

  const tensor = tf.node.decodeImage(data, 3);
  const predictions = await nsfw.classify(tensor as any);
  tensor.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
  return predictions;
}

export default analysePicture;
