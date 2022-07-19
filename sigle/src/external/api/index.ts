import { sigleConfig } from '../../config';
import { OpenAPI } from './generated';

OpenAPI.BASE = sigleConfig.apiUrl!;
OpenAPI.WITH_CREDENTIALS = true;

export * from './generated';
