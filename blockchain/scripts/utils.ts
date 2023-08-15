import { ContractTransactionResponse, EventLog } from 'ethers';

export async function getEvents(tx: ContractTransactionResponse): Promise<EventLog[]> {
  const receipt = await tx.wait();
  if (!receipt) {
    return [];
  }
  return receipt.logs.filter((event): event is EventLog => 'eventName' in event);
}

export async function getEvent(
  tx: ContractTransactionResponse,
  eventName: string
): Promise<EventLog | undefined> {
  return getEvents(tx).then((events) => events.find((event) => event.eventName == eventName));
}
