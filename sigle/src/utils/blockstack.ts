import { UserSession, AppConfig } from '@stacks/auth';
import { Storage } from '@stacks/storage';

export const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const storage = new Storage({ userSession });
