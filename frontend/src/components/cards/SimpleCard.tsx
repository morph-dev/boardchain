import { Card, CardBody, CardHeader, CardProps, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export interface SimpleCardProps extends PropsWithChildren<CardProps> {
  title: string;
}

export default function SimpleCard({ title, children, ...props }: SimpleCardProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <Text fontWeight="bold" fontSize="lg">
          {title}
        </Text>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
