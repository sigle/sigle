import { readFileSync } from 'fs';
import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
  Transporter,
} from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import mjml2html from 'mjml';
import { compile } from 'handlebars';
import { EnvironmentVariables } from '../environment/environment.validation';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private isTestMode = false;
  private templates: {
    verifyEmail: HandlebarsTemplateDelegate<{
      verifyEmailUrl: string;
    }>;
  };
  private senderAddress: string;

  constructor(
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.templates = {
      verifyEmail: compile(
        readFileSync(
          `${process.cwd()}/src/email/templates/verify-email.handlebars`,
          {
            encoding: 'utf-8',
          },
        ).toString(),
      ),
    };

    this.senderAddress = this.configService.get('EMAIL_FROM');
  }

  async onModuleInit() {
    const emailServerUser = this.configService.get('EMAIL_SERVER_USER');
    const emailServerHost = this.configService.get('EMAIL_SERVER_HOST');
    const emailServerPort = this.configService.get('EMAIL_SERVER_PORT') || 587;
    const emailServerPassword = this.configService.get('EMAIL_SERVER_PASSWORD');
    if (
      !emailServerUser ||
      !emailServerHost ||
      !emailServerPort ||
      !emailServerPassword
    ) {
      this.logger.debug('Starting in test mode.');
      const testAccount = await createTestAccount();
      this.isTestMode = true;
      this.transporter = createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      return;
    }

    this.transporter = createTransport({
      host: emailServerHost,
      port: emailServerPort,
      secure: false,
      auth: {
        user: emailServerUser,
        pass: emailServerPassword,
      },
    });
  }

  async sendMail(mailOptions: Mail.Options) {
    if (!mailOptions.from) {
      mailOptions.from = `"Sigle" <${this.senderAddress}>`;
    }
    const info = await this.transporter.sendMail(mailOptions);
    this.logger.debug(`Email sent: ${info.messageId}`);

    if (this.isTestMode) {
      this.logger.debug(`Preview URL: ${getTestMessageUrl(info)}`);
    }

    return info;
  }

  generateVerifyEmailTemplate({ verifyEmailUrl }: { verifyEmailUrl: string }) {
    const MJMLTemplate = this.templates.verifyEmail({ verifyEmailUrl });
    const { html: mjmlHtml, errors: mjmlErrors } = mjml2html(MJMLTemplate);
    if (mjmlErrors && mjmlErrors.length > 0) {
      this.sentryService
        .instance()
        .captureMessage('Failed to generate template', {
          level: 'error',
          extra: {
            template: 'verify-email',
            mjmlErrors,
          },
        });
      throw new BadRequestException('Failed to generate template');
    }
    return mjmlHtml;
  }
}
