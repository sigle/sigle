import { config } from '../config';

export const snippet = `
(function(f, a, t, h, o, m){
a[h]=a[h]||function(){
    (a[h].q=a[h].q||[]).push(arguments)
};
o=f.createElement('script'),
m=f.getElementsByTagName('script')[0];
o.async=1; o.src=t; o.id='fathom-script';
m.parentNode.insertBefore(o,m)
})(document, window, '//cdn.usefathom.com/tracker.js', 'fathom');
fathom('set', 'siteId', '${config.fathomSiteId}');
fathom('trackPageview');
`;

export const pageview = () => {
  if (config.fathomSiteId) {
    (window as any).fathom('trackPageview');
  }
};
