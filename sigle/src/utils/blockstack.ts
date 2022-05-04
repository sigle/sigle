import { UserSession, AppConfig } from '@stacks/auth';
import {
  UserSession as LegacyUserSession,
  AppConfig as LegacyAppConfig,
} from '@stacks/legacy-auth';
import { Storage } from '@stacks/storage';

export const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const storage = new Storage({ userSession });

export const legacyAppConfig = new LegacyAppConfig([
  'store_write',
  'publish_data',
]);

export const legacyUserSession = new LegacyUserSession({
  appConfig: legacyAppConfig,
});
