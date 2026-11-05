// Each category is a full Chakra colour palette, so a subtree can set
// `colorPalette="<category>"` and components read `colorPalette.*`.
//
// Hues are the original five; lightness is tuned for WCAG contrast (measured
// with the WCAG 2.x relative-luminance formula):
//   light: solid vs white `contrast` text, fg vs white page bg (#FFFFFF)
//   dark : solid vs `contrast` text (gray.950 #09090B), fg vs page bg (gray.950)
//
//              light solid  light fg   dark solid  dark fg
//   scenes       4.76        7.23        7.03       8.63
//   restaurants  4.71        7.28        7.07       8.63
//   hotels       4.77        7.25        7.02       8.71
//   transports   4.72        7.22        7.02       8.66
//   activities   4.70        7.21        7.01       8.62
//
// Neutral text: fg.subtle (gray.500) on white 4.83, fg.muted (gray.600) 7.73;
// dark fg.subtle (gray.400) on gray.950 7.76.
// Re-measure if you change a value: the formula is WCAG 2.x relative luminance.
interface Shade {
  dark: string;
  light: string;
}

const palette = ({
  solid,
  emphasized,
  fg,
  muted,
  subtle,
}: {
  emphasized: Shade;
  fg: Shade;
  muted: Shade;
  solid: Shade;
  subtle: Shade;
}) => ({
  contrast: { value: { _dark: '{colors.gray.950}', base: 'white' } },
  emphasized: { value: { _dark: fg.dark, base: emphasized.light } },
  // Accent text on the page background. The scene theme's `link` recipe keeps
  // ordinary links on the inherited text colour, so this only colours what
  // opts in (eyebrows, "查看更多", active nav, outline/ghost buttons).
  fg: { value: { _dark: fg.dark, base: fg.light } },
  focusRing: { value: { _dark: solid.dark, base: solid.light } },
  muted: { value: { _dark: muted.dark, base: muted.light } },
  solid: { value: { _dark: solid.dark, base: solid.light } },
  subtle: { value: { _dark: subtle.dark, base: subtle.light } },
});

const colors = {
  activities: palette({
    emphasized: { dark: '#7EB0D9', light: '#19609C' },
    fg: { dark: '#7EB0D9', light: '#175A92' },
    muted: { dark: '#2B3F4F', light: '#CCDDEB' },
    solid: { dark: '#629FD1', light: '#1F77C1' },
    subtle: { dark: '#1F2D38', light: '#E9F0F6' },
  }),
  bg: {
    DEFAULT: { value: { _dark: '{colors.gray.950}', base: 'white' } },
    muted: { value: { _dark: '{colors.gray.800}', base: '{colors.gray.100}' } },
    subtle: {
      value: { _dark: '{colors.gray.900}', base: '{colors.gray.50}' },
    },
  },
  border: {
    DEFAULT: {
      value: { _dark: '{colors.gray.800}', base: '{colors.gray.200}' },
    },
    emphasized: {
      value: { _dark: '{colors.gray.700}', base: '{colors.gray.300}' },
    },
    muted: { value: { _dark: '{colors.gray.900}', base: '{colors.gray.100}' } },
  },
  fg: {
    DEFAULT: {
      value: { _dark: '{colors.gray.50}', base: '{colors.gray.900}' },
    },
    muted: { value: { _dark: '{colors.gray.300}', base: '{colors.gray.600}' } },
    subtle: {
      value: { _dark: '{colors.gray.400}', base: '{colors.gray.500}' },
    },
  },
  hotels: palette({
    emphasized: { dark: '#B4AC88', light: '#665E37' },
    fg: { dark: '#B4AC88', light: '#5F5733' },
    muted: { dark: '#454236', light: '#E2DFD5' },
    solid: { dark: '#A39A6E', light: '#7D7343' },
    subtle: { dark: '#312F26', light: '#F2F1ED' },
  }),
  restaurants: palette({
    emphasized: { dark: '#8AB593', light: '#386842' },
    fg: { dark: '#8AB593', light: '#34603D' },
    muted: { dark: '#364539', light: '#D5E2D8' },
    solid: { dark: '#72A67D', light: '#458051' },
    subtle: { dark: '#263128', light: '#EDF2EE' },
  }),
  scenes: palette({
    emphasized: { dark: '#86B3B3', light: '#376565' },
    fg: { dark: '#86B3B3', light: '#335E5E' },
    muted: { dark: '#364545', light: '#D5E2E2' },
    solid: { dark: '#6DA3A3', light: '#437C7C' },
    subtle: { dark: '#263131', light: '#EDF2F2' },
  }),
  transports: palette({
    emphasized: { dark: '#C1A59E', light: '#815246' },
    fg: { dark: '#C1A59E', light: '#784C41' },
    muted: { dark: '#453936', light: '#E2D8D5' },
    solid: { dark: '#B49289', light: '#9E6555' },
    subtle: { dark: '#312826', light: '#F2EEED' },
  }),
};

export default colors;
