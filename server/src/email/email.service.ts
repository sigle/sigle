import { Injectable } from '@nestjs/common';
import { generateJSON } from '@tiptap/html';

@Injectable()
export class EmailService {
  htmlToMJML(html: string): string {
    // TODO sanitise html or elsewhere ?
    return '';
  }
}
