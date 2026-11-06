import { Box, Stack, Table, Text } from '@chakra-ui/react';

import { getThsrOverview } from '@/services/transports';

import { TransportSection, Unavailable } from './section-state';

const ThsrSection = async () => {
  const overview = await getThsrOverview();

  if (!overview) {
    return (
      <TransportSection title="高鐵">
        <Unavailable />
      </TransportSection>
    );
  }

  const { fares, firstDeparture, lastDeparture, stations, trainCount } =
    overview;
  const price = new Map(
    fares.map((fare) => [`${fare.originId}>${fare.destinationId}`, fare.price]),
  );
  const fareOf = (from: string, to: string) =>
    price.get(`${from}>${to}`) ?? price.get(`${to}>${from}`);

  return (
    <TransportSection title="高鐵">
      <Stack gap="4">
        <Text color="fg.muted" textStyle="body-sm">
          {stations.map((station) => station.name).join('、')}
          {trainCount > 0 ? ` · 每日 ${trainCount} 班次` : ''}
          {firstDeparture && lastDeparture
            ? ` · 首班 ${firstDeparture}、末班 ${lastDeparture}`
            : ''}
        </Text>
        {fares.length > 0 && (
          <Box overflowX="auto">
            <Table.Root size="sm" variant="outline">
              <Table.Caption srOnly>
                高鐵標準車廂成人票價（新臺幣）
              </Table.Caption>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader scope="col">起訖</Table.ColumnHeader>
                  {stations.map((station) => (
                    <Table.ColumnHeader
                      key={station.id}
                      scope="col"
                      textAlign="end"
                      whiteSpace="nowrap"
                    >
                      {station.name}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {stations.map((from) => (
                  <Table.Row key={from.id}>
                    <Table.ColumnHeader scope="row" whiteSpace="nowrap">
                      {from.name}
                    </Table.ColumnHeader>
                    {stations.map((to) => (
                      <Table.Cell key={to.id} textAlign="end">
                        {from.id === to.id
                          ? '–'
                          : (fareOf(from.id, to.id) ?? '')}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Stack>
    </TransportSection>
  );
};

export default ThsrSection;
