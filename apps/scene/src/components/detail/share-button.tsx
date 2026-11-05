'use client';

import { Button } from '@chakra-ui/react';
import { useAppToast } from '@f2e/ui/toast';
import { FiShare2 } from 'react-icons/fi';

const ShareButton = ({ title }: { title: string }) => {
  const toast = useAppToast();

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissed by the user.
      }

      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: '已複製連結' });
    } catch {
      toast({ status: 'error', title: '無法複製連結' });
    }
  };

  return (
    <Button colorPalette="gray" onClick={share} size="sm" variant="outline">
      <FiShare2 />
      分享
    </Button>
  );
};

export default ShareButton;
