import { IconButton, IconButtonProps, useClipboard } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

export interface CopyButtonProps extends Omit<IconButtonProps, 'aria-label'> {
  text: string;
}

export default function CopyButton({ text, ...props }: CopyButtonProps) {
  const { onCopy: copyToClipboard } = useClipboard(text);
  return (
    <IconButton
      aria-label="copy"
      icon={<CopyIcon />}
      isRound
      variant="ghost"
      onClick={copyToClipboard}
      {...props}
    />
  );
}
