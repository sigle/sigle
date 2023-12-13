import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getToken } from 'next-auth/jwt';
import { EnvironmentVariables } from './environment/environment.validation';

/**
 * AuthGuard for the application. Require a valid next-auth JWT, the JWT is parsed and
 * we extract the user address. The address is then injected in the request object so it
 * can be used in the controllers.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Allow tests to bypass the authentication.
    if (
      this.configService.get('NODE_ENV') === 'test' &&
      request.cookies['next-auth.session-token']
    ) {
      request.user = {
        stacksAddress: request.cookies['next-auth.session-token'],
      };
      return true;
    }

    const token = await getToken({
      req: { ...request, headers: request.raw.rawHeaders },
      secret: this.configService.get('NEXTAUTH_SECRET'),
    });

    if (!token || !token.sub) {
      return false;
    }

    // Inject the user address so it can be used in subsequent requests.
    request.user = {
      stacksAddress: token.sub,
    };

    return true;
  }
}
