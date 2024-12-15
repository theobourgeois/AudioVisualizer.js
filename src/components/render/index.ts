import { Preset, RenderFunc } from "..";
import { renderLight } from "./light";
import { renderLineWaveform } from "./line-waveform";
import { renderShape } from "./shape";
import { renderText } from "./text";
import { renderWaveform } from "./waveform";

export const renderFuncs: {
  [P in Preset]: RenderFunc<P>;
} = {
  text: renderText,
  shape: renderShape,
  light: renderLight,
  waveform: renderWaveform,
  "line-waveform": renderLineWaveform,
} as const;
