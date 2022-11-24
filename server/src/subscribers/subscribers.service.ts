import { BadGatewayException, Injectable } from '@nestjs/common';
import { validate } from 'deep-email-validator';
import { CreateSubscriberDto } from './dto/createSubscriber.dto';

@Injectable()
export class SubscribersService {
  async create({ stacksAddress, email }: CreateSubscriberDto) {
    // TODO verify that user has been created in DB

    const res = await validate({
      email,
      // This is already checked by the router
      validateRegex: false,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      // Ideally we want to set this one to true.
      // But because of many false positives we disabled it.
      validateSMTP: false,
    });
    if (!res.valid) {
      throw new BadGatewayException('Invalid email.');
    }

    // TODO verify that user has email settings setup
    // TODO create subscriber via Mail API in right list
  }
}
