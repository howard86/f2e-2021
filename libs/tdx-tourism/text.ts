export interface TextStep {
  heading?: string;
  text: string;
}

const TRAFFIC_MARKER = /［(?<heading>[^［］]{1,20})］/gu;

/**
 * Splits TDX's TrafficInfo on its `［開車前往］` / `［大眾運輸］` markers into
 * steps. Consecutive runs under the same heading merge into one step (one
 * line per run); text before the first marker becomes a heading-less step.
 * Returns undefined when the text has no markers so callers keep it plain.
 */
export const splitTrafficInfo = (
  value: string | null | undefined,
): TextStep[] | undefined => {
  const source = value?.replaceAll('\r\n', '\n').trim();

  if (!source) {
    return;
  }

  const markers = [...source.matchAll(TRAFFIC_MARKER)];

  if (markers.length === 0) {
    return;
  }

  const steps: TextStep[] = [];
  const push = (heading: string | undefined, raw: string) => {
    const text = raw.trim();

    if (!text) {
      return;
    }

    const last = steps.at(-1);

    if (last && last.heading === heading) {
      last.text = `${last.text}\n${text}`;
    } else {
      steps.push(heading ? { heading, text } : { text });
    }
  };

  push(undefined, source.slice(0, markers[0].index));

  for (const [index, marker] of markers.entries()) {
    const start = marker.index + marker[0].length;
    const end = markers[index + 1]?.index ?? source.length;

    push(marker.groups.heading.trim(), source.slice(start, end));
  }

  return steps.length > 0 ? steps : undefined;
};
