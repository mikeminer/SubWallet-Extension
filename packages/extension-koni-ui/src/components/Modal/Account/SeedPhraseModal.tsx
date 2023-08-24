// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BackIcon from '@subwallet/extension-koni-ui/components/Icon/BackIcon';
import CloseIcon from '@subwallet/extension-koni-ui/components/Icon/CloseIcon';
import { BaseModal } from '@subwallet/extension-koni-ui/components/Modal/BaseModal';
import WordPhrase from '@subwallet/extension-koni-ui/components/WordPhrase';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from '@subwallet/extension-koni-ui/constants/account';
import useGetDefaultAccountName from '@subwallet/extension-koni-ui/hooks/account/useGetDefaultAccountName';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useUnlockChecker from '@subwallet/extension-koni-ui/hooks/common/useUnlockChecker';
import useClickOutSide from '@subwallet/extension-koni-ui/hooks/dom/useClickOutSide';
import { createAccountSuriV2, createSeedV2 } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { renderModalSelector } from '@subwallet/extension-koni-ui/utils/common/dom';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { KeypairType } from '@polkadot/util-crypto/types';

type Props = ThemeProps & {
  accountTypes: KeypairType[],
  modalId: string,
  onBack?: () => void;
  onSubmitSuccess?: () => void;
};

const Component: React.FC<Props> = ({ accountTypes, className, modalId, onBack, onSubmitSuccess }: Props) => {
  const { t } = useTranslation();
  const { checkActive, inactiveModal } = useContext(ModalContext);
  const isActive = checkActive(modalId);
  const notify = useNotification();
  const accountName = useGetDefaultAccountName();
  const checkUnlock = useUnlockChecker();

  const [seedPhrase, setSeedPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [createSeedTrigger, setCreateSeedTrigger] = useState<string>(`${Date.now()}`);

  useEffect(() => {
    createSeedV2(undefined, undefined, [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE])
      .then((response): void => {
        const phrase = response.seed;

        setSeedPhrase(phrase);
      })
      .catch((e: Error) => {
        console.error(e);
      });
  }, [createSeedTrigger]);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
    setCreateSeedTrigger(`${Date.now()}`);
  }, [inactiveModal, modalId]);

  const _onBack = useCallback(() => {
    onBack?.();
    setCreateSeedTrigger(`${Date.now()}`);
  }, [onBack]);

  const onSubmit = useCallback(() => {
    if (!seedPhrase) {
      return;
    }

    checkUnlock().then(() => {
      setLoading(true);

      setTimeout(() => {
        createAccountSuriV2({
          name: accountName,
          suri: seedPhrase,
          types: accountTypes,
          isAllowed: true
        })
          .then(() => {
            onSubmitSuccess?.();
          })
          .catch((error: Error): void => {
            notify({
              message: error.message,
              type: 'error'
            });
          })
          .finally(() => {
            setLoading(false);
            onCancel();
          });
      }, 500);
    }).catch(() => {
      // User cancel unlock
    });
  }, [seedPhrase, checkUnlock, accountName, accountTypes, onSubmitSuccess, notify, onCancel]);

  useClickOutSide(isActive, renderModalSelector(className), onCancel);

  return (
    <BaseModal
      className={CN(className)}
      closeIcon={!!onBack && (<BackIcon />)}
      id={modalId}
      maskClosable={false}
      onCancel={onBack ? _onBack : onCancel}
      rightIconProps={ onBack
        ? ({
          icon: <CloseIcon />,
          onClick: onCancel
        })
        : undefined}
      title={t<string>('Your recovery phrase')}
    >
      <div className='items-container'>
        <div className='__description'>
          {t('Keep your recovery phrase in a safe place, and never disclose it. Anyone with this phrase can take control of your assets.')}
        </div>
        <WordPhrase
          className={'__word-phrase'}
          seedPhrase={seedPhrase}
        />
        <Button
          block={true}
          disabled={!seedPhrase}
          icon={(
            <Icon
              className={'icon-submit'}
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onSubmit}
        >
          {t('I have saved it somewhere safe')}
        </Button>
      </div>
    </BaseModal>
  );
};

const SeedPhraseModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.items-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.size
    },

    '.__description': {
      fontSize: token.size,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4,
      textAlign: 'center'
    },

    '.__word-phrase': {
      '.ant-btn.-size-md': {
        height: 40,
        lineHeight: '40px'
      }
    }
  };
});

export default SeedPhraseModal;
