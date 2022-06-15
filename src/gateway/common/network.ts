import {
  BehaviorSubject,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  Observable,
  publishReplay,
  refCount,
} from 'rxjs';

import { useObservable } from '../../common/hooks/useObservable';
import { localStorageManager } from '../../common/utils/localStorageManager';
import { cardanoNetwork } from '../../network/cardano/cardano';
import { Network } from '../../network/common/Network';
import { ergoNetwork } from '../../network/ergo/ergo';

const SELECTED_NETWORK_KEY = 'ergodex-selected-network-key';

export const networks: Network<any, any, any>[] = [ergoNetwork, cardanoNetwork];

const selectedNetworkName =
  localStorageManager.get<string>(SELECTED_NETWORK_KEY);
export const selectedNetwork: Network<any, any, any> = selectedNetworkName
  ? networks.find((n) => n.name === selectedNetworkName)!
  : cardanoNetwork;

const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
if (link) {
  link.href = `/favicon-${selectedNetwork.name}.svg`;
}

const updateSelectedNetwork$ = new BehaviorSubject<Network<any, any>>(
  selectedNetwork,
);

export const changeSelectedNetwork = (network: Network<any, any>): void => {
  localStorageManager.set(SELECTED_NETWORK_KEY, network.name);
  window.location.reload();
};

export const selectedNetwork$: Observable<Network<any, any>> =
  updateSelectedNetwork$.pipe(
    distinctUntilKeyChanged('name'),
    publishReplay(1),
    refCount(),
  );

export const networksInitialized$ = selectedNetwork.initialized$.pipe(
  distinctUntilChanged(),
  publishReplay(1),
  refCount(),
);

export const initializeNetwork = (): void => selectedNetwork.initialize();

export const useSelectedNetwork = (): [Network<any, any>, boolean, Error] =>
  useObservable(selectedNetwork$, [], selectedNetwork);
