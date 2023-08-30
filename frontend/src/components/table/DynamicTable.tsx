import {
  ChakraProps,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { DynamicTableColumn } from './DynamicTableColumn';

export interface DynamicTableProps<T> extends ChakraProps {
  items: readonly T[];
  itemFn: (item: T) => string;
  title?: string;
  columns: DynamicTableColumn<T>[];
}

export default function DynamicTable<T>({
  items,
  itemFn,
  title,
  columns,
  ...props
}: DynamicTableProps<T>) {
  return (
    <TableContainer {...props}>
      <Table>
        {title && (
          <TableCaption placement="top" fontSize="lg" m={0} p={0}>
            {title}
          </TableCaption>
        )}
        <Thead>
          <Tr>
            {columns.map(({ header, headerProps }) => (
              <Th key={header} textAlign="center" {...headerProps}>
                {header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <Tr key={itemFn(item)}>
              {columns.map(({ header, Component }) => (
                <Td key={header}>
                  <Component item={item} />
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
