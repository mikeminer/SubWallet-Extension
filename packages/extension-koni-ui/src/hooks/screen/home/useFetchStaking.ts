// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { APIItemState, StakingItem } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';
import { StakingDataType, StakingType } from '@subwallet/extension-koni-ui/hooks/screen/home/types';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { useSelector } from 'react-redux';

export default function useFetchStaking (networkKey: string): StakingType {
  const { networkMap, price: priceReducer, stakeUnlockingInfo: stakeUnlockingInfoJson, staking: stakingReducer, stakingReward: stakingRewardReducer } = useSelector((state: RootState) => state);

  const { priceMap } = priceReducer;
  const parsedPriceMap: Record<string, number> = {};

  const stakingItems = stakingReducer.details;
  const stakingRewardList = stakingRewardReducer.details;
  const unlockingItems = stakeUnlockingInfoJson.details;
  const stakeUnlockingTimestamp = stakeUnlockingInfoJson.timestamp;

  const readyStakingItems: StakingItem[] = [];
  const stakingData: StakingDataType[] = [];
  let loading = !stakingRewardReducer.ready;

  const showAll = networkKey.toLowerCase() === ALL_ACCOUNT_KEY.toLowerCase();

  stakingItems.forEach((stakingItem) => {
    if (stakingItem.state === APIItemState.READY) {
      loading = false;

      const networkJson = networkMap[stakingItem.chain];

      if (stakingItem.balance && parseFloat(stakingItem.balance) > 0 && (Math.round(parseFloat(stakingItem.balance) * 100) / 100) !== 0) {
        parsedPriceMap[stakingItem.chain] = priceMap[networkJson?.coinGeckoKey || stakingItem.chain];
        readyStakingItems.push(stakingItem);
      }
    }
  });

  console.log('readyStakingItems', readyStakingItems);

  if (!showAll) {
    const filteredStakingItems: StakingItem[] = [];

    readyStakingItems.forEach((item) => {
      if (item.chain.toLowerCase() === networkKey.toLowerCase()) {
        filteredStakingItems.push(item);
      }
    });

    for (const stakingItem of filteredStakingItems) {
      const stakingDataType = { staking: stakingItem } as StakingDataType;

      for (const reward of stakingRewardList) {
        if (stakingItem.chain === reward.chainId && reward.state === APIItemState.READY) {
          stakingDataType.reward = reward;
        }
      }

      Object.entries(unlockingItems).forEach(([key, info]) => {
        if (key === stakingItem.chain) {
          stakingDataType.staking = {
            ...stakingItem,
            unlockingInfo: info
          } as StakingItem;
        }
      });

      stakingData.push(stakingDataType);
    }
  } else {
    for (const stakingItem of readyStakingItems) {
      const stakingDataType = { staking: stakingItem } as StakingDataType;

      for (const reward of stakingRewardList) {
        if (stakingItem.chain === reward.chainId && reward.state === APIItemState.READY) {
          stakingDataType.reward = reward;
        }
      }

      Object.entries(unlockingItems).forEach(([key, info]) => {
        if (key === stakingItem.chain) {
          stakingDataType.staking = {
            ...stakingItem,
            unlockingInfo: info
          } as StakingItem;
        }
      });

      stakingData.push(stakingDataType);
    }
  }

  return {
    loading,
    data: stakingData,
    priceMap: parsedPriceMap,
    stakeUnlockingTimestamp
  } as StakingType;
}
