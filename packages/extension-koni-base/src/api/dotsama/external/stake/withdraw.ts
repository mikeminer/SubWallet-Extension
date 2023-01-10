// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicTxResponse } from '@subwallet/extension-base/background/KoniTypes';
import { getWithdrawalExtrinsic } from '@subwallet/extension-koni-base/api/bonding';
import { ExternalProps } from '@subwallet/extension-koni-base/api/dotsama/external/shared';
import { signAndSendExtrinsic } from '@subwallet/extension-koni-base/api/dotsama/shared/signAndSendExtrinsic';

interface WithdrawStakeExternalProps extends ExternalProps {
  action?: string;
  address: string;
  validatorAddress?: string;
}

export const createWithdrawStakeExternal = async ({ action,
  address,
  callback,
  chainInfo,
  id,
  setState,
  signerType,
  substrateApi,
  updateState,
  validatorAddress }: WithdrawStakeExternalProps) => {
  const txState: BasicTxResponse = {};
  const extrinsic = await getWithdrawalExtrinsic(substrateApi, chainInfo.slug, address, validatorAddress, action);

  await signAndSendExtrinsic({
    type: signerType,
    callback: callback,
    id: id,
    setState: setState,
    substrateApi: substrateApi,
    address: address,
    txState: txState,
    updateState: updateState,
    extrinsic: extrinsic,
    errorMessage: 'error withdrawing'
  });
};
