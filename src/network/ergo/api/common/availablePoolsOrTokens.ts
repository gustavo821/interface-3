import uniqBy from 'lodash/uniqBy';
import {
  combineLatest,
  first,
  map,
  Observable,
  publishReplay,
  refCount,
  switchMap,
} from 'rxjs';

import { AmmPool } from '../../../../common/models/AmmPool';
import { AssetInfo } from '../../../../common/models/AssetInfo';
import { localStorageManager } from '../../../../common/utils/localStorageManager';
import { networkAsset } from '../networkAsset/networkAsset';
import { defaultTokenList$ } from './defaultTokenList';
import { rawAmmPoolsWithLiquidity$ } from './rawAmmPools';

const rawAssetsWithLiquidity$ = rawAmmPoolsWithLiquidity$.pipe(
  map((pools) => pools.flatMap((p) => [p.x.asset, p.y.asset])),
  map((assets) => uniqBy(assets, 'id')),
  switchMap((assets) =>
    defaultTokenList$.pipe(
      map((defaultTokenList) =>
        assets.filter(
          (asset) =>
            !defaultTokenList.tokensMap.has(asset.id) &&
            asset.id !== networkAsset.id,
        ),
      ),
    ),
  ),
  publishReplay(1),
  refCount(),
);

const IMPORTED_TOKEN_ASSETS_KEY = 'ergo-imported-token';

export const DEFAULT_IMPORTED_TOKEN_ASSETS = [networkAsset.id];

const importedTokenAssets$ = localStorageManager
  .getStream<string[]>(IMPORTED_TOKEN_ASSETS_KEY)
  .pipe(
    map((importedTokenAssets) =>
      importedTokenAssets && importedTokenAssets?.length > 0
        ? importedTokenAssets
        : DEFAULT_IMPORTED_TOKEN_ASSETS,
    ),
    publishReplay(1),
    refCount(),
  );

export const importTokenAsset = (assets: AssetInfo | AssetInfo[]): void => {
  importedTokenAssets$.pipe(first()).subscribe((oldImportedTokenAssets) => {
    localStorageManager.set(
      IMPORTED_TOKEN_ASSETS_KEY,
      oldImportedTokenAssets.concat(
        assets instanceof Array ? assets.map((i) => i.id) : assets.id,
      ),
    );
  });
};

export const filterUnavailablePools = (
  ammPools: AmmPool[],
): Observable<AmmPool[]> =>
  combineLatest([
    defaultTokenList$,
    importedTokenAssets$,
    rawAssetsWithLiquidity$,
  ]).pipe(
    map(([defaultTokenList, importedTokens, rawAssetsWithLiquidity]) =>
      ammPools.filter(
        (ap) =>
          (importedTokens.includes(ap.x.asset.id) ||
            defaultTokenList.tokensMap.has(ap.x.asset.id) ||
            rawAssetsWithLiquidity.some((a) => a.id === ap.x.asset.id)) &&
          (importedTokens.includes(ap.y.asset.id) ||
            defaultTokenList.tokensMap.has(ap.y.asset.id) ||
            rawAssetsWithLiquidity.some((a) => a.id === ap.y.asset.id)),
      ),
    ),
  );

export const filterUnavailableAndImportedTokenAssets = (
  assets: AssetInfo[],
): Observable<AssetInfo[]> =>
  defaultTokenList$.pipe(
    map((defaultTokenList) =>
      assets.filter(
        (ai) =>
          defaultTokenList.tokensMap.has(ai.id) || networkAsset.id === ai.id,
      ),
    ),
  );

export const filterUnavailableAndDefaultTokenAssets = (
  assets: AssetInfo[],
): Observable<AssetInfo[]> =>
  combineLatest([importedTokenAssets$, defaultTokenList$]).pipe(
    map(([importedTokens, defaultTokenList]) =>
      assets.filter(
        (ai) =>
          importedTokens.includes(ai.id) &&
          ai.id !== networkAsset.id &&
          !defaultTokenList.tokensMap.has(ai.id),
      ),
    ),
  );

export const filterAvailableTokenAssets = (
  assets: AssetInfo[],
): Observable<AssetInfo[]> =>
  combineLatest([defaultTokenList$, importedTokenAssets$]).pipe(
    map(([defaultTokenList, importedTokens]) =>
      assets.filter(
        (ai) =>
          !importedTokens.includes(ai.id) &&
          !defaultTokenList.tokensMap.has(ai.id),
      ),
    ),
  );
