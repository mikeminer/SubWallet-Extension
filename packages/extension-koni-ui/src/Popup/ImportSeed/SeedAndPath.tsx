// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';
import type { ThemeProps } from '../../types';
import type { AccountInfo } from '.';

import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Dropdown } from '@polkadot/extension-koni-ui/components';
import AccountInfoContainer from '@polkadot/extension-koni-ui/components/AccountInfoContainer';
import ButtonArea from '@polkadot/extension-koni-ui/components/ButtonArea';
import InputWithLabel from '@polkadot/extension-koni-ui/components/InputWithLabel';
import NextStepButton from '@polkadot/extension-koni-ui/components/NextStepButton';
import TextAreaWithLabel from '@polkadot/extension-koni-ui/components/TextAreaWithLabel';
import Warning from '@polkadot/extension-koni-ui/components/Warning';
import { validateSeed } from '@polkadot/extension-koni-ui/messaging';
import { objectSpread } from '@polkadot/util';

import useGenesisHashOptions from '../../hooks/useGenesisHashOptions';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  className?: string;
  onNextStep: () => void;
  onAccountChange: (account: AccountInfo | null) => void;
  type: KeypairType;
  account: any;
  name: string | null;
}

function SeedAndPath ({ account, className, name, onAccountChange, onNextStep, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const genesisOptions = useGenesisHashOptions();
  const [address, setAddress] = useState('');
  const [seed, setSeed] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [advanced, setAdvances] = useState(false);
  const [error, setError] = useState('');
  const [genesis, setGenesis] = useState('');

  useEffect(() => {
    // No need to validate an empty seed
    // we have a dedicated error for this
    if (!seed) {
      onAccountChange(null);

      return;
    }

    const suri = `${seed || ''}${path || ''}`;

    validateSeed(suri, type)
      .then((validatedAccount) => {
        setError('');
        setAddress(validatedAccount.address);
        onAccountChange(
          objectSpread<AccountInfo>({}, validatedAccount, { genesis, type })
        );
      })
      .catch(() => {
        setAddress('');
        onAccountChange(null);
        setError(path
          ? t<string>('Invalid mnemonic seed or derivation path')
          : t<string>('Invalid mnemonic seed')
        );
      });
  }, [t, genesis, seed, path, onAccountChange, type]);

  const _onToggleAdvanced = useCallback(() => {
    setAdvances(!advanced);
  }, [advanced]);

  return (
    <>
      <div className={className}>
        <div className='account-info-wrapper'>
          <AccountInfoContainer
            address={account?.address}
            className='account-info'
            genesisHash={account?.genesis}
            name={name}
          >
            <TextAreaWithLabel
              className='seedInput'
              isError={!!error}
              isFocused
              label={t<string>('existing 12 or 24-word mnemonic seed')}
              onChange={setSeed}
              rowsCount={2}
              value={seed || ''}
            />
            {!!error && !seed && (
              <Warning
                className='seedError'
                isBelowInput
                isDanger
              >
                {t<string>('Mnemonic needs to contain 12, 15, 18, 21, 24 words')}
              </Warning>
            )}
            <Dropdown
              className='genesisSelection'
              label={t<string>('Network')}
              onChange={setGenesis}
              options={genesisOptions}
              value={genesis}
            />
            <div
              className='advancedToggle'
              onClick={_onToggleAdvanced}
            >
              <FontAwesomeIcon
                color='#888888'
                icon={advanced ? faChevronDown : faChevronRight}
              />
              <span>{t<string>('advanced')}</span>
            </div>
            { advanced && (
              <InputWithLabel
                className='derivationPath'
                isError={!!path && !!error}
                label={t<string>('derivation path')}
                onChange={setPath}
                value={path || ''}
              />
            )}
            {!!error && !!seed && (
              <Warning
                isDanger
              >
                {error}
              </Warning>
            )}
          </AccountInfoContainer>
        </div>
        <ButtonArea>
          <NextStepButton
            className='next-step-btn'
            isDisabled={!address || !!error}
            onClick={onNextStep}
          >
            {t<string>('Next Step')}
          </NextStepButton>
        </ButtonArea>
      </div>
    </>
  );
}

export default styled(SeedAndPath)(({ theme }: ThemeProps) => `
  padding: 25px 15px 15px;
  flex: 1;
  margin-top: -25px;
  overflow-y: auto;

  .advancedToggle {
    color: ${theme.textColor};
    cursor: pointer;
    line-height: ${theme.lineHeight};
    letter-spacing: 0.04em;
    opacity: 0.65;
    text-transform: uppercase;
    margin-top: 13px;

    > span {
      font-size: ${theme.inputLabelFontSize};
      line-height: 26px;
      margin-left: .5rem;
      vertical-align: middle;
      color: ${theme.textColor2};
      font-weight: 500;
    }
  }

  .account-info-wrapper {
  }

  .account-info {
    padding-bottom: 23px;
  }

  .next-step-btn {
    > .children {
      display: flex;
      align-items: center;
      position: relative;
      justify-content: center;
    }
  }

  .genesisSelection {
    line-height: 26px;
    label {
      color: ${theme.textColor2};
    }
  }

  .seedInput {
    margin-bottom: 16px;
    color: ${theme.textColor2};
    textarea {
      height: 80px;
      margin-top: 4px;
    }
  }

  .seedError {
    margin-bottom: 1rem;
  }
`);
