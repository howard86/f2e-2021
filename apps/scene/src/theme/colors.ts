// Each category is a full Chakra colour palette, so a subtree can set
// `colorPalette="<category>"` and components read `colorPalette.*`.
const palette = ({
  solid,
  muted,
  emphasized,
}: {
  emphasized: string;
  muted: string;
  solid: string;
}) => ({
  contrast: { value: 'white' },
  emphasized: { value: emphasized },
  // Built-in recipes (Link, ghost/outline buttons) colour text with
  // colorPalette.fg; keep it the neutral text colour they had before.
  fg: { value: '{colors.gray.fg}' },
  focusRing: { value: solid },
  muted: { value: muted },
  solid: { value: solid },
  subtle: { value: muted },
});

const colors = {
  activities: palette({
    emphasized: '{colors.blue.700}',
    muted: '{colors.blue.200}',
    solid: '{colors.blue.400}',
  }),
  // Keep the default text colours the app was designed with.
  fg: {
    DEFAULT: { value: '{colors.blackAlpha.800}' },
    muted: { value: '{colors.blackAlpha.600}' },
    subtle: { value: '{colors.blackAlpha.500}' },
  },
  // The hotels list used the darker shade for contrast against white text;
  // every hotel page now does.
  hotels: palette({
    emphasized: '#857F66',
    muted: '#E6DDB2',
    solid: '#A39D81',
  }),
  restaurants: palette({
    emphasized: '#5E6E62',
    muted: '#A7B4AA',
    solid: '#738677',
  }),
  scenes: palette({
    emphasized: '#587474',
    muted: '#A7D4DA',
    solid: '#6E9292',
  }),
  transports: palette({
    emphasized: '#81564B',
    muted: '#E6BEB4',
    solid: '#AA796C',
  }),
};

export default colors;
