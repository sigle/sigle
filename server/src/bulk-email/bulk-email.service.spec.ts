import { Test, TestingModule } from '@nestjs/testing';
import { SENTRY_TOKEN } from '@ntegral/nestjs-sentry';
import { Story } from '../external/gaia';
import { BulkEmailService } from './bulk-email.service';

describe('BulkEmailService', () => {
  let service: BulkEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkEmailService,
        {
          provide: SENTRY_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BulkEmailService>(BulkEmailService);
  });

  describe('htmlToMJML', () => {
    it('should convert h2', () => {
      expect(service.htmlToMJML('<h2>Hello</h2>')).toEqual(
        '<mj-text><h2>Hello</h2></mj-text>',
      );
    });

    it('should convert h3', () => {
      expect(service.htmlToMJML('<h3>Hello</h3>')).toEqual(
        '<mj-text><h3>Hello</h3></mj-text>',
      );
    });

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
      // mixed
      expect(
        service.htmlToMJML(
          '<p>Hello <strong><em><s><u>world</u></s></em></strong></p>',
        ),
      ).toEqual(
        '<mj-text>Hello <strong><em><s><u>world</u></s></em></strong></mj-text>',
      );
      // a
      expect(
        service.htmlToMJML(
          '<p>Hello <a target="_blank" rel="noopener noreferrer nofollow" href="https://app.sigle.io">world</a></p>',
        ),
      ).toEqual(
        '<mj-text>Hello <a target="_blank" rel="noopener noreferrer nofollow" href="https://app.sigle.io">world</a></mj-text>',
      );
    });

    it('should convert list', () => {
      expect(
        service.htmlToMJML(
          '<ul><li><p>Hello 1</p></li><li><p>Hello 2</p></li></ul>',
        ),
      ).toEqual(
        '<mj-list><mj-li>Hello 1</mj-li><mj-li>Hello 2</mj-li></mj-list>',
      );
    });

    it('should convert blockquote', () => {
      expect(service.htmlToMJML('<blockquote>Hello</blockquote>')).toEqual(
        '<mj-text><blockquote>Hello</blockquote></mj-text>',
      );

      expect(
        service.htmlToMJML('<blockquote><p>Hello</p></blockquote>'),
      ).toEqual('<mj-text><blockquote><p>Hello</p></blockquote></mj-text>');
    });

    it('should convert image', () => {
      expect(
        service.htmlToMJML(
          '<img src="https://gaia.blockstack.org/hub/1Mqh6Lqyqdjcu8PHczewej4DZmMjFp1ZEt/photos/ZuwzlaWfMhjG-yJbG1WhP/slRWpY-LD7gYPxZuJYuJg-Screenshot 2022-08-24 at 10.07.14.png">',
        ),
      ).toEqual(
        '<mj-image src="https://gaia.blockstack.org/hub/1Mqh6Lqyqdjcu8PHczewej4DZmMjFp1ZEt/photos/ZuwzlaWfMhjG-yJbG1WhP/slRWpY-LD7gYPxZuJYuJg-Screenshot%202022-08-24%20at%2010.07.14.png" />',
      );
    });

    it('should convert figure', () => {
      expect(
        service.htmlToMJML(
          '<figure><img src="https://gaia.blockstack.org/hub/1GT81E4hd1s5cDyY2qhVUEvRUbkqBKWLte/photos/H4J8BEo-7kPMjU70BoTYt/huHZftWPTSggEV9ygItM_-banner.png"><figcaption>Test <em>caption</em> <strong>bold <em>italicbold</em> </strong><a href="http://localhost:3000/stories/H4J8BEo-7kPMjU70BoTYt">link</a> test</figcaption></figure>',
        ),
      ).toEqual(
        '<mj-image src="https://gaia.blockstack.org/hub/1GT81E4hd1s5cDyY2qhVUEvRUbkqBKWLte/photos/H4J8BEo-7kPMjU70BoTYt/huHZftWPTSggEV9ygItM_-banner.png" /><mj-text align="center" font-size="14px" color="#6b7280">Test <em>caption</em> <strong>bold <em>italicbold</em> </strong><a href="http://localhost:3000/stories/H4J8BEo-7kPMjU70BoTYt">link</a> test</mj-text>',
      );
    });

    it('should convert hr', () => {
      expect(service.htmlToMJML('<hr />')).toEqual('<mj-divider />');
    });

    it('should convert CTA', () => {
      expect(
        service.htmlToMJML(
          '<a data-type="button-cta" href="https://twitter.com/"><button data-size="lg">Follow me on Twitter 🐦</button></a>',
        ),
      ).toEqual(
        '<mj-button href="https://twitter.com/">Follow me on Twitter 🐦</mj-button>',
      );
    });

    it('should convert twitter embed', () => {
      expect(
        service.htmlToMJML(
          '<div data-twitter="" data-twitter-id="1610573364296302592" url="https://twitter.com/sigleapp/status/1610573364296302592">',
        ),
      ).toEqual(
        '<mj-text><a href="https://twitter.com/sigleapp/status/1610573364296302592">https://twitter.com/sigleapp/status/1610573364296302592</a></mj-text>',
      );
    });

    it('should convert full article', () => {
      expect(
        service.htmlToMJML(
          '<p><em>Hot from the press: Sigle 1.5</em></p><h2>Sigle x Xverse</h2><p>Ever been frustrated not being able to check out new Sigle posts, or write your own, during long metro rides or in waiting rooms? Ever felt like there was nothing left to do but stare at the chipped off paint? Alright, this may be <s>a little</s> dramatic. But being deprived of your favourite content on mobile simply won’t do.</p><p>As we grow and improve Sigle, we want to allow our users to write on the go and read on the bus, and we are excited to announce that Sigle is now featured on the <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.xverse.app/">Xverse app</a>, in the app section!</p><img src="https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/Ggryl-wuLF5Lk1_QFrLzw-XVerseXSigle.png"><p>Xverse is a mobile Stacks compatible wallet that allows you to manage your accounts and access apps through their built-in web browser. Users can also lock their Stacks in the Xverse non-custodial Stacking pool and earn native Bitcoin with zero fees.</p><h2>Editor improvements</h2><p>This release includes many bug fixes in the editor. And as we strive to give you the best writing experience possible, we’ve also implemented plenty of improvements which we hope you’ll enjoy!</p><p>We’ve made some writing blocks context-aware, to help you write faster and execute quick actions. Also, not only can you now <strong>drag and drop images</strong> directly into the editor, you can embed tweets in your articles with <strong>Twitter blocks</strong>!</p><h2>Changelog Sigle 1.5</h2><ul><li><p>Added <strong>Twitter embeds</strong> to the editor.</p></li></ul><img src="https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/vjyOifZ3XNEOrtnDGWfV5-final.png"><ul><li><p>The editor now <strong>works on mobile</strong>.</p></li></ul><img src="https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/ngUQ5NSE55EUi-WpuE1ts-Frame 286.png"><ul><li><p>Added <strong>drag-and-drop support</strong> to the editor.</p></li><li><p>Improved drag-and-drop experience for the cover image.</p></li></ul><img src="https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/tzAo1G4LiTsgWdRlXgzWK-triptolisbon.png"><p></p><ul><li><p>Many changes to the interface to make the website <strong>responsive on mobile</strong>.</p></li><li><p>Fixed an issue causing articles not to be correctly indexed by crawlers.</p></li><li><p>Many small bug fixes across the app.</p></li></ul><p>See the full list of changes <a target="_blank" rel="noopener noreferrer nofollow" href="https://github.com/sigle/sigle/releases/tag/%40sigle%2Fapp%401.5.0">here</a>.</p><h2>The Explorer Guild Birthday</h2><img src="https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/0TwJ6ctL9x4t1jxdzuMPv-Pen Run_1.png"><p>This may be hard to believe, but the Explorer Guild is celebrating their first birthday! To mark the occasion, we’ve put together our very first <a target="_blank" rel="noopener noreferrer nofollow" href="https://app.sigle.io/sigleapp.id.blockstack/h8Kxgg9_Ck6f0V-YgB7Gz">Pen Run Contest</a>, don’t forget to join for a chance to win our very first 1/1 NFT!</p><img src="https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/aZnSwTcYu2hjtk22FwVCR-Wizard explorer (1).gif"><p>We also want to thank all of our holders and community for supporting us and allowing us to build Sigle for over a year. We’re excited for what’s ahead of us, and can’t wait to continue the adventure with you by our sides. In the meantime, why not take a walk down memory lane in the <a target="_blank" rel="noopener noreferrer nofollow" href="https://museum.explorerguild.io/">Explorer Guild Museum</a>?</p><h2>Explorers keep exploring</h2><img src="https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/yCsXl0hAEomHW571dqCiG-Capture d’écran 2022-11-01 à 14.54.30.png"><p>The Explorer Guild is placed as the 12th most traded project on STX, with over 177k STX of volume. We’re also very excited to see our floor price go back up, almost reaching 100 STX.</p><h2>What’s next</h2><p>As we strive to make our user experience as seamless as possible, it’s important to us that old and new users understand where they’re going when they reach the platform. The next release will focus on <strong>improving the onboarding experience</strong> even more.</p><p><strong>Newsletter features will also be top of mind over the next few months.</strong> We want to allow our writers to create direct communication channels with their audiences, to help them grow and expand their communities.</p><p>The Sigle team 📝</p>',
        ),
      ).toMatchSnapshot();
    });
  });

  describe('storyToMJML', () => {
    const stacksAddress = 'SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W';
    const story: Story = {
      id: 'h8Kxgg9_Ck6f0V-YgB7Gz',
      type: 'public',
      title: 'Pen Run #1: Writing contest!',
      content:
        '<p>For our NFT collection <a target="_blank" rel="noopener noreferrer nofollow" href="https://gamma.io/collections/the-explorer-guild">The Explorer Guild</a>’s 1 year anniversary, enter our very first storytelling contest and challenge your creativity! Ready? Set… <strong>Pen Run!</strong></p><h2><strong>The rules!</strong></h2><h3><strong>🎭 Theme</strong></h3><p>We kick off this first Pen Run with a very open theme!</p><p>Based on<a target="_blank" rel="noopener noreferrer nofollow" href="https://app.sigle.io/sigleapp.id.blockstack/9YaADPQyujrXa28aiNYzV"> <u>the first chapter of the story of the Explorer Guild</u></a>, <strong>write your own second chapter for the story.</strong></p><p>Step into Jules Verne\'s shoes, free your imagination and continue the tale. Make us dream, laugh, thrill! No matter where your creativity takes you... keep surprising your readers!</p><blockquote><p><em>You’re welcome to use </em><a target="_blank" rel="noopener noreferrer nofollow" href="https://app.sigle.io/sigleapp.id.blockstack/q3UgkR4eZvsQPwK3yAeLV"><em>our second chapter</em></a><em> as inspiration, but keep in mind yours can be entirely different, and the end doesn’t have to match what we’ve written.</em></p></blockquote><p><strong>You\'re free to explore any path!</strong></p><img src="https://gaia.blockstack.org/hub/1Gmf7Wt2WJTcbwUHAoY1tTeBZegD4zVifY/photos/Tp18iSo3f8vv1FIodesL1/uEpDz4VsGym5elLB70g8K-Drawing-1.png" alt=""><h3><strong>🏆 Prizes</strong></h3><p>🥇 The lucky winner will get <strong>the very first ANIMATED 1/1</strong> inspired by The Explorer Guild original collection and their story will be published in "The Explorer Guild Story" as the second version of chapter II.</p><img src="https://gaia.blockstack.org/hub/1Gmf7Wt2WJTcbwUHAoY1tTeBZegD4zVifY/photos/_O8ZASigEfspvOLcocIIz-Wizard%20explorer%20(1).gif" alt=""><p>🥈 The second place will get the first non-animated 1/1 ever created, also inspired by the original collection.</p><img src="https://gaia.blockstack.org/hub/1Gmf7Wt2WJTcbwUHAoY1tTeBZegD4zVifY/photos/dJEdQCM1rO3uOG5ZckoBQ-wizard_2_low.png" alt=""><h3><strong>🧑‍⚖️ Jury</strong></h3><p>We are pleased to welcome one of the most highly-rated writers on Sigle with 80+ articles on the platform and 5k+ views on his page!</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://twitter.com/jackbinswitch"><strong>Jack Binswitch</strong></a> and the Sigle team will read your articles and vote for the best fiction between November 18th and December 1st.</p><p>The 2 best stories will be announced on December 2nd! 🎉</p><h3><strong>How do you enter?</strong></h3><p>1️⃣ <strong>Write</strong> your best fiction on<a target="_blank" rel="noopener noreferrer nofollow" href="http://app.sigle.io/"><strong> </strong></a><a target="_blank" rel="noopener noreferrer nofollow" href="http://app.sigle.io"><strong>app.sigle.io</strong></a>.&nbsp;</p><p>2️⃣ <strong>Publish</strong> <em>(don\'t just "save" it in your drafts!)</em> your article so everyone can read it.</p><p>3️⃣ <strong>Share</strong> your story on Twitter and tag <a target="_blank" rel="noopener noreferrer nofollow" href="https://twitter.com/sigleapp"><strong>@sigleapp</strong></a> and <a target="_blank" rel="noopener noreferrer nofollow" href="https://twitter.com/jackbinswitch"><strong>@jackbinswitch</strong></a> or directly on our Discord in the "✨| share-stories" channel before November 17th, 2022.</p><blockquote><p><em>The frequency of writing contests will depend on general enthusiasm of the community at the end of this first one.</em></p></blockquote><p>Good luck, word wizard! <strong>🪄</strong></p>',
      createdAt: 1666094000000,
      updatedAt: 1666086464680,
      contentVersion: '2',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/h8Kxgg9_Ck6f0V-YgB7Gz/1666086010586-Pen Run_1.png',
      metaTitle: 'Pen Run #1: Writing contest!',
      metaDescription:
        'For our NFT collection The Explorer Guild’s 1 year anniversary, enter our very first storytelling contest and challenge your creativity!',
    };
    const settings = {};

    it('should render story with template', () => {
      expect(
        service.storyToMJML({
          stacksAddress,
          username: 'sigle.btc',
          story,
          settings,
        }),
      ).toMatchSnapshot();
    });

    it('should render story with site url', () => {
      expect(
        service.storyToMJML({
          stacksAddress,
          username: 'sigle.btc',
          story,
          settings: {
            siteUrl: 'https://www.sigle.io',
          },
        }),
      ).toMatchSnapshot();
    });

    it('should render story with twitter url', () => {
      expect(
        service.storyToMJML({
          stacksAddress,
          username: 'sigle.btc',
          story,
          settings: {
            siteTwitterHandle: 'sigleapp',
          },
        }),
      ).toMatchSnapshot();
    });
  });
});
