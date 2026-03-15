import redirect from './redirect/redirect';
import orphanRedirect from './orphan-redirect';

export default {
  redirect: { schema: redirect },
  'orphan-redirect': { schema: orphanRedirect },
};
