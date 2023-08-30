import { ContractTransactionResponse, EventLog, Interface, Log, UndecodedEventLog } from 'ethers';
import { TypedContractEvent, TypedEventLog } from '../typechain-types/common';

async function getEvents(
  tx: ContractTransactionResponse,
  ...interfaces: Interface[]
): Promise<EventLog[]> {
  const receipt = await tx.wait();
  if (!receipt) {
    return [];
  }

  const toEventLog = (log: EventLog | Log): EventLog | null => {
    if ('eventName' in log) {
      return log;
    }
    for (const iface of interfaces) {
      const fragment = log.topics.length ? iface.getEvent(log.topics[0]) : null;
      if (!fragment) {
        return null;
      }

      try {
        return new EventLog(log, iface, fragment);
      } catch (error: any) {
        return null;
      }
    }
    return null;
  };

  return receipt.logs.map(toEventLog).filter((event): event is EventLog => event !== null);
}

export async function getEvent<E extends TypedContractEvent>(
  tx: ContractTransactionResponse,
  contractEvent: E,
  ...interfaces: Interface[]
): Promise<TypedEventLog<E> | undefined> {
  return getEvents(tx, ...interfaces).then((events) =>
    events.find((event): event is TypedEventLog<E> => event.eventName == contractEvent.name)
  );
}

export async function getEventArgs<E extends TypedContractEvent>(
  tx: ContractTransactionResponse,
  contractEvent: E,
  ...interfaces: Interface[]
): Promise<TypedEventLog<E>['args']> {
  const event = await getEvent(tx, contractEvent, ...interfaces);

  if (!event) {
    console.log((await tx.wait())?.logs);
    throw Error(`Event "${contractEvent.name}" not found!`);
  }

  return event.args;
}

export function getEventArgsFn<E extends TypedContractEvent>(
  contractEvent: E,
  ...interfaces: Interface[]
) {
  return (tx: ContractTransactionResponse) => getEventArgs(tx, contractEvent, ...interfaces);
}
