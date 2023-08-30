import { TableColumnHeaderProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export type DynamicTableColumnProps<T> = {
  item: T;
};

export type DynamicTableColumn<T> = {
  header: string;
  headerProps?: TableColumnHeaderProps;
  component: (props: DynamicTableColumnProps<T>) => ReactNode;
};

export function createColumn<T>(
  header: string,
  component: (props: { item: T }) => ReactNode,
  headerProps?: TableColumnHeaderProps
): DynamicTableColumn<T> {
  return {
    header,
    headerProps,
    component,
  };
}
