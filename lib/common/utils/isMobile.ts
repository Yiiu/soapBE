import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

const mobileRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

const tabletRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i;

export function isMobile(opts?: any) {
  if (!opts) opts = {};
  let { ua } = opts;
  if (!ua && typeof navigator !== 'undefined') ua = navigator.userAgent;
  if (ua && ua.headers && typeof ua.headers['user-agent'] === 'string') {
    ua = ua.headers['user-agent'];
  }
  if (typeof ua !== 'string') return false;

  return opts.tablet ? tabletRE.test(ua) : mobileRE.test(ua);
}

export const useIsMobile = () => {
  const [is, setIs] = useState<boolean>(() => isMobile());
  useEffect(() => {
    const call = debounce(() => {
      setIs(isMobile());
    }, 1000);
    window.addEventListener('resize', call);
    return () => window.removeEventListener('resize', call);
  }, []);
  return is;
};
