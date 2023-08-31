import { ContractTransactionReceipt, EventLog, Interface, Log } from 'ethers';
import { TypedContractEvent, TypedEventLog } from '../typechain-types/common';

export function printHighGasUsage(tx: ContractTransactionReceipt | null, gasLimit = 200_000) {
  if (tx && tx.gasUsed > gasLimit) {
    console.error(`\x1b[33mHigh gas usage: ${(tx.gasUsed / 1000n).toString()} K\x1b[0m`);
  }
  return tx;
}

async function getEvents(
  tx: ContractTransactionReceipt | null,
  ...interfaces: Interface[]
): Promise<EventLog[]> {
  if (!tx) {
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

  return tx.logs.map(toEventLog).filter((event): event is EventLog => event !== null);
}

export async function getEvent<E extends TypedContractEvent>(
  tx: ContractTransactionReceipt | null,
  contractEvent: E,
  ...interfaces: Interface[]
): Promise<TypedEventLog<E> | undefined> {
  return getEvents(tx, ...interfaces).then((events) =>
    events.find((event): event is TypedEventLog<E> => event.eventName == contractEvent.name)
  );
}

export async function getEventArgs<E extends TypedContractEvent>(
  tx: ContractTransactionReceipt | null,
  contractEvent: E,
  ...interfaces: Interface[]
): Promise<TypedEventLog<E>['args']> {
  const event = await getEvent(tx, contractEvent, ...interfaces);

  if (!event) {
    throw Error(`Event "${contractEvent.name}" not found!`);
  }

  return event.args;
}

export function getEventArgsFn<E extends TypedContractEvent>(
  contractEvent: E,
  ...interfaces: Interface[]
) {
  return (tx: ContractTransactionReceipt | null) => getEventArgs(tx, contractEvent, ...interfaces);
}
