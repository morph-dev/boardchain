import { X as XIcon, Circle as OIcon } from 'lucide-react';
import { Icon, Square, SquareProps } from '@chakra-ui/react';

const inlineProps = {
  size: '1.5em',
  as: 'span',
  display: 'inline-flex',
  verticalAlign: 'middle',
} as const;

export interface SymbolProps extends SquareProps {
  inline?: boolean;
}

function Symbol({ inline, children, ...props }: SymbolProps) {
  return (
    <Square {...(inline ? inlineProps : {})} {...props}>
      {children}
    </Square>
  );
}

export function XSymbol(props: SymbolProps) {
  return (
    <Symbol color="tictactoe.x" {...props}>
      <Icon as={XIcon} boxSize="full" />
    </Symbol>
  );
}

export function OSymbol(props: SymbolProps) {
  return (
    <Symbol color="tictactoe.o" {...props}>
      <Icon as={OIcon} boxSize="80%" />
    </Symbol>
  );
}
