import { Test, TestingModule } from '@nestjs/testing';
import { DismissableFlagsController } from './dismissable-flags.controller';

describe('DismissableFlagsController', () => {
  let controller: DismissableFlagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DismissableFlagsController],
    }).compile();

    controller = module.get<DismissableFlagsController>(
      DismissableFlagsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
