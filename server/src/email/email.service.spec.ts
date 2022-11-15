import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('htmlToMJML', () => {
    it('should convert p', () => {
      expect(service.htmlToMJML('<p>Hello</p>')).toEqual(
        '<mj-text>Hello</mj-text>',
      );
    });
  });
});
