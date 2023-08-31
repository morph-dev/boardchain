import { TableColumnHeaderProps, Text, TextProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Address } from 'viem';
import AddressWithCopy from '../AddressWithCopy';

export interface DynamicTableColumnProps<T> {
  item: T;
}

export type DynamicTableColumn<T> = {
  header: string;
  headerProps?: TableColumnHeaderProps;
  Component: (props: DynamicTableColumnProps<T>) => ReactNode;
};

export function textColumn<T>(
  header: string,
  textFn: (item: T) => string,
  props?: TextProps
): DynamicTableColumn<T> {
  return {
    header,
    Component: ({ item }: DynamicTableColumnProps<T>) => (
      <Text textAlign="center" {...props}>
        {textFn(item)}
      </Text>
    ),
  };
}

export function addressColumn<T>(
  header: string,
  addressFn: (item: T) => Address
): DynamicTableColumn<T> {
  return {
    header,
    Component: ({ item }: DynamicTableColumnProps<T>) => (
      <AddressWithCopy address={addressFn(item)} showMe />
    ),
  };
}
