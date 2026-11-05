'use client';

import { Icon, IconButton, type IconButtonProps } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { FiMoon, FiSun } from 'react-icons/fi';

// Both icons are always rendered and CSS picks one, so server and client
// markup match before the stored theme is known.
const ColorModeToggle = (props: IconButtonProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <IconButton
      aria-label="切換深色模式"
      onClick={handleToggle}
      rounded="full"
      size="sm"
      variant="ghost"
      {...props}
    >
      <Icon asChild display={{ _dark: 'none', base: 'block' }}>
        <FiMoon />
      </Icon>
      <Icon asChild display={{ _dark: 'block', base: 'none' }}>
        <FiSun />
      </Icon>
    </IconButton>
  );
};

export default ColorModeToggle;
