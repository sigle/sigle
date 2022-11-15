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
      // strong
      expect(service.htmlToMJML('<p>Hello <strong>world</strong></p>')).toEqual(
        '<mj-text>Hello <strong>world</strong></mj-text>',
      );
      // em
      expect(service.htmlToMJML('<p>Hello <em>world</em></p>')).toEqual(
        '<mj-text>Hello <em>world</em></mj-text>',
      );
      // u
      expect(service.htmlToMJML('<p>Hello <u>world</u></p>')).toEqual(
        '<mj-text>Hello <u>world</u></mj-text>',
      );
      // s
      expect(service.htmlToMJML('<p>Hello <s>world</s></p>')).toEqual(
        '<mj-text>Hello <s>world</s></mj-text>',
      );
    });
  });
});
