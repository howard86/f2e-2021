const getAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/big-smile/svg?seed=${encodeURIComponent(seed)}`;

export default getAvatar;
