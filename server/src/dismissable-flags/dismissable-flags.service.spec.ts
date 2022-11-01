import { Test, TestingModule } from '@nestjs/testing';
import { DismissableFlagsService } from './dismissable-flags.service';

describe('DismissableFlagsService', () => {
  let service: DismissableFlagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DismissableFlagsService],
    }).compile();

    service = module.get<DismissableFlagsService>(DismissableFlagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
