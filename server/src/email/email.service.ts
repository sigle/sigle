import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
  Transporter,
} from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EnvironmentVariables } from '../environment/environment.validation';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private isTestMode: boolean = false;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    // const emailServerUser = this.configService.get('EMAIL_SERVER_USER');
    // const emailServerHost = this.configService.get('EMAIL_SERVER_HOST');
    // const emailServerPort = this.configService.get('EMAIL_SERVER_PORT');
    // const emailServerPassword = this.configService.get('EMAIL_SERVER_PASSWORD');
    // if (
    //   !emailServerUser ||
    //   !emailServerHost ||
    //   !emailServerPort ||
    //   !emailServerPassword
    // ) {
    //   throw new Error('Missing email configuration');
    // }
    // this.transporter = createTransport({
    //   host: emailServerHost,
    //   port: emailServerPort,
    //   secure: false,
    //   auth: {
    //     user: emailServerUser,
    //     pass: emailServerPassword,
    //   },
    // });
  }

  async onModuleInit() {
    // TODO production mode

    let testAccount = await createTestAccount();
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
  }

  async sendMail(mailOptions: Mail.Options) {
    let info = await this.transporter.sendMail(mailOptions);
    this.logger.debug(`Email sent: ${info.messageId}`);

    if (this.isTestMode) {
      this.logger.debug(`Preview URL: ${getTestMessageUrl(info)}`);
    }

    return info;
  }
}
