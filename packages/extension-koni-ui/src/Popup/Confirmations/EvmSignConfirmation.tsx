// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ConfirmationGeneralInfo from '@subwallet/extension-koni-ui/components/Confirmation/ConfirmationGeneralInfo';
import { completeConfirmation } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {ConfirmationDefinitions, ConfirmationResult} from "@subwallet/extension-base/background/KoniTypes";

interface Props extends ThemeProps {
  request: ConfirmationDefinitions['evmSendTransactionRequest'][0]
}

async function handleConfirm (id: string, payload: string) {
  return await completeConfirmation('evmSendTransactionRequest', {id, isApproved: true, payload} as ConfirmationResult<string>);
}

async function handleCancel ({ id }: ConfirmationDefinitions['evmSendTransactionRequest'][0]) {
  return await completeConfirmation('evmSendTransactionRequest', {id, isApproved: false} as ConfirmationResult<string>);
}

function Component ({ className, request }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const {} = request;
  // Handle buttons actions

  const onCancel = useCallback(() => {
    setLoading(true);
    handleCancel(request).finally(() => {
      setLoading(false);
    });
  }, [request]);

  const onConfirm = useCallback(() => {
    setLoading(true);
    handleConfirm(request.id, '').finally(() => {
      setLoading(false);
    });
  }, [request]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className={'account-list text-center'}>
          <Typography.Title level={4}>
            {t('Signing....')}
          </Typography.Title>
          <Typography.Paragraph className='text-tertiary'>
            {JSON.stringify(request.payload)}
          </Typography.Paragraph>
        </div>
      </div>
      <div className='confirmation-footer'>
        <Button
          disabled={loading}
          icon={<Icon phosphorIcon={XCircle} />}
          onClick={onCancel}
          schema={'secondary'}
        >
          {t('Cancel')}
        </Button>
        <Button
          icon={<Icon phosphorIcon={CheckCircle} />}
          loading={loading}
          onClick={onConfirm}
        >
          {t('Approve')}
        </Button>
      </div>
    </>
  );
}

const EvmSignConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  }
}));

export default EvmSignConfirmation;
