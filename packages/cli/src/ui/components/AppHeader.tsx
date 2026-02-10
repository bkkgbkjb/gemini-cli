/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from 'ink';
import { useMemo } from 'react';
import { UserAccountManager, AuthType } from '@google/gemini-cli-core';
import { Tips } from './Tips.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { Banner } from './Banner.js';
import { useBanner } from '../hooks/useBanner.js';
import { useTips } from '../hooks/useTips.js';
import { theme } from '../semantic-colors.js';
import { ThemedGradient } from './ThemedGradient.js';
import { CliSpinner } from './CliSpinner.js';

interface AppHeaderProps {
  version: string;
}

const ICON = `▝▜▄  
  ▝▜▄
 ▗▟▀ 
▝▀    `;

export const AppHeader = ({ version }: AppHeaderProps) => {
  const settings = useSettings();
  const config = useConfig();
  const { terminalWidth, bannerData, bannerVisible, updateInfo } = useUIState();

  const { bannerText } = useBanner(bannerData);
  const { showTips } = useTips();

  const authType = config.getContentGeneratorConfig()?.authType;

  const { email, tierName } = useMemo(() => {
    if (!authType) {
      return { email: undefined, tierName: undefined };
    }
    const userAccountManager = new UserAccountManager();
    return {
      email: userAccountManager.getCachedGoogleAccount(),
      tierName: config.getUserTierName(),
    };
  }, [config, authType]);

  const showHeader = !(
    settings.merged.ui.hideBanner || config.getScreenReader()
  );

  return (
    <Box flexDirection="column">
      {showHeader && (
        <Box flexDirection="row" marginTop={1} marginBottom={1} paddingLeft={2}>
          <Box flexShrink={0}>
            <ThemedGradient>{ICON}</ThemedGradient>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            {/* Line 1: Gemini CLI vVersion [Updating] */}
            <Box>
              <Text bold color={theme.text.primary}>
                Gemini CLI
              </Text>
              <Text color={theme.text.secondary}> v{version}</Text>
              {updateInfo && (
                <Box marginLeft={2}>
                  <Text color={theme.text.secondary}>
                    <CliSpinner /> Updating
                  </Text>
                </Box>
              )}
            </Box>

            {/* Line 2: Blank */}
            <Box height={1} />

            {/* Line 3: User Email /auth */}
            <Box>
              <Text color={theme.text.primary}>
                {authType === AuthType.LOGIN_WITH_GOOGLE ? (
                  <Text>{email ?? 'Logged in with Google'}</Text>
                ) : (
                  `Authenticated with ${authType}`
                )}
              </Text>
              <Text color={theme.text.secondary}> /auth</Text>
            </Box>

            {/* Line 4: Tier Name /upgrade */}
            <Box>
              <Text color={theme.text.primary}>
                {tierName ?? 'Gemini Code Assist for individuals'}
              </Text>
              <Text color={theme.text.secondary}> /upgrade</Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* {showHeader && <HorizontalLine width={terminalWidth} position="top" />} */}

      {bannerVisible && bannerText && (
        <Banner
          width={terminalWidth}
          bannerText={bannerText}
          isWarning={bannerData.warningText !== ''}
        />
      )}

      {!(settings.merged.ui.hideTips || config.getScreenReader()) &&
        showTips && <Tips config={config} />}
    </Box>
  );
};
