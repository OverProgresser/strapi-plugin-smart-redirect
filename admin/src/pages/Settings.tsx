import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Main,
  Toggle,
  Typography,
  Loader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SingleSelect,
  SingleSelectOption,
  TextInput,
} from '@strapi/design-system';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import { getTranslation } from '../utils/getTranslation';

interface ContentTypeInfo {
  uid: string;
  displayName: string;
  attributes: string[];
}

interface ContentTypeSettings {
  enabled: boolean;
  slugField: string | null;
  urlPrefix?: string;
}

interface PluginSettings {
  enabledContentTypes: Record<string, ContentTypeSettings>;
  autoRedirectOnSlugChange: boolean;
  chainDetectionEnabled: boolean;
  orphanRedirectEnabled: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
  enabledContentTypes: {},
  autoRedirectOnSlugChange: true,
  chainDetectionEnabled: true,
  orphanRedirectEnabled: true,
};

const Settings = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const t = (id: string, defaultMessage: string) =>
    formatMessage({ id: getTranslation(id), defaultMessage });

  const [contentTypes, setContentTypes] = useState<ContentTypeInfo[]>([]);
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ctRes, settingsRes] = await Promise.all([
          get(`/${PLUGIN_ID}/content-types`),
          get(`/${PLUGIN_ID}/settings`),
        ]);
        setContentTypes(ctRes.data as ContentTypeInfo[]);
        const loaded = settingsRes.data as Partial<PluginSettings>;
        setSettings({
          ...DEFAULT_SETTINGS,
          ...loaded,
          enabledContentTypes: loaded.enabledContentTypes ?? {},
        });
      } catch {
        toggleNotification({
          type: 'danger',
          message: t('settings.load.error', 'Failed to load settings'),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFeatureToggle = (key: keyof Omit<PluginSettings, 'enabledContentTypes'>) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggle = (uid: string) => {
    setSettings((prev) => ({
      ...prev,
      enabledContentTypes: {
        ...prev.enabledContentTypes,
        [uid]: {
          ...prev.enabledContentTypes[uid],
          enabled: !prev.enabledContentTypes[uid]?.enabled,
          slugField: prev.enabledContentTypes[uid]?.slugField ?? null,
        },
      },
    }));
  };

  const handleSlugFieldChange = (uid: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      enabledContentTypes: {
        ...prev.enabledContentTypes,
        [uid]: {
          ...prev.enabledContentTypes[uid],
          enabled: prev.enabledContentTypes[uid]?.enabled ?? false,
          slugField: value,
        },
      },
    }));
  };

  const handleUrlPrefixChange = (uid: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      enabledContentTypes: {
        ...prev.enabledContentTypes,
        [uid]: {
          ...prev.enabledContentTypes[uid],
          enabled: prev.enabledContentTypes[uid]?.enabled ?? false,
          slugField: prev.enabledContentTypes[uid]?.slugField ?? null,
          urlPrefix: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await post(`/${PLUGIN_ID}/settings`, settings);
      toggleNotification({
        type: 'success',
        message: t('settings.saved', 'Settings saved successfully'),
      });
    } catch {
      toggleNotification({
        type: 'danger',
        message: t('settings.save.error', 'Failed to save settings'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Main>
        <Flex justifyContent="center" padding={8}>
          <Loader>{t('settings.loading', 'Loading settings...')}</Loader>
        </Flex>
      </Main>
    );
  }

  return (
    <Main>
      <Box padding={8}>
        <Flex justifyContent="space-between" alignItems="center" paddingBottom={6}>
          <Typography variant="alpha" tag="h1">
            {t('settings.title', 'Redirect Manager Settings')}
          </Typography>
          <Button onClick={handleSave} loading={isSaving}>
            {t('settings.save', 'Save')}
          </Button>
        </Flex>

        {/* Feature toggles */}
        <Box paddingBottom={6}>
          <Typography variant="delta" tag="h2" paddingBottom={4}>
            {t('settings.features', 'Features')}
          </Typography>
          <Flex direction="column" gap={5} alignItems="flex-start">
            <Box>
              <Typography paddingBottom={1} fontWeight="bold">
                {t('settings.autoRedirect', 'Auto-create redirect when slug changes')}
              </Typography>
              <Toggle
                checked={settings.autoRedirectOnSlugChange}
                onChange={() => handleFeatureToggle('autoRedirectOnSlugChange')}
                onLabel={t('common.on', 'On')}
                offLabel={t('common.off', 'Off')}
                aria-label={t('settings.autoRedirect', 'Auto-create redirect on slug change')}
              />
            </Box>

            <Box>
              <Typography paddingBottom={1} fontWeight="bold">
                {t('settings.chainDetection', 'Enable chain detection (blocks chains longer than 10 hops)')}
              </Typography>
              <Toggle
                checked={settings.chainDetectionEnabled}
                onChange={() => handleFeatureToggle('chainDetectionEnabled')}
                onLabel={t('common.on', 'On')}
                offLabel={t('common.off', 'Off')}
                aria-label={t('settings.chainDetection', 'Enable chain detection')}
              />
            </Box>

            <Box>
              <Typography paddingBottom={1} fontWeight="bold">
                {t('settings.orphanTracking', 'Enable orphan redirect tracking (creates pending entries on content deletion)')}
              </Typography>
              <Toggle
                checked={settings.orphanRedirectEnabled}
                onChange={() => handleFeatureToggle('orphanRedirectEnabled')}
                onLabel={t('common.on', 'On')}
                offLabel={t('common.off', 'Off')}
                aria-label={t('settings.orphanTracking', 'Enable orphan redirect tracking')}
              />
            </Box>
          </Flex>
        </Box>

        {/* Content type table */}
        <Typography variant="delta" tag="h2" paddingBottom={4}>
          {t('settings.contentTypes', 'Content Types')}
        </Typography>
        <Table colCount={4} rowCount={contentTypes.length}>
          <Thead>
            <Tr>
              <Th>
                <Typography variant="sigma">{t('settings.contentType', 'Content Type')}</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">{t('settings.enabled', 'Enabled')}</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">{t('settings.slugField', 'Slug Field')}</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">{t('settings.urlPrefix', 'URL Prefix')}</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {contentTypes.map((ct) => {
              const ctSettings = settings.enabledContentTypes?.[ct.uid] ?? {
                enabled: false,
                slugField: null,
              };

              return (
                <Tr key={ct.uid}>
                  <Td>
                    <Typography>{ct.displayName}</Typography>
                  </Td>
                  <Td>
                    <Checkbox
                      checked={ctSettings.enabled}
                      onCheckedChange={() => handleToggle(ct.uid)}
                      aria-label={`Enable redirect tracking for ${ct.displayName}`}
                    />
                  </Td>
                  <Td>
                    <SingleSelect
                      value={ctSettings.slugField ?? ''}
                      onChange={(value: string | number) =>
                        handleSlugFieldChange(ct.uid, String(value))
                      }
                      disabled={!ctSettings.enabled}
                      placeholder={t('settings.slugField.placeholder', 'Select slug field')}
                    >
                      {ct.attributes.map((attr) => (
                        <SingleSelectOption key={attr} value={attr}>
                          {attr}
                        </SingleSelectOption>
                      ))}
                    </SingleSelect>
                  </Td>
                  <Td>
                    <TextInput
                      placeholder={t('settings.urlPrefix.placeholder', '/blog')}
                      value={ctSettings.urlPrefix ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUrlPrefixChange(ct.uid, e.target.value)
                      }
                      disabled={!ctSettings.enabled}
                      aria-label={`URL prefix for ${ct.displayName}`}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Main>
  );
};

export { Settings };
