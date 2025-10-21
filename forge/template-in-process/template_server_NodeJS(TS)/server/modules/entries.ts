import type {
  RouteGroup,
} from '../core/types/types.js';

import mainRoutes from './main/routes.js';
import authRoutes from './auth/routes.js';
import chatRoutes from './chat/routes.js';


export const usingRoutes: RouteGroup[] = [
  {
    path: '/auth',
    route: authRoutes as any
  },
  {
    path: '/chats',
    route: chatRoutes as any
  },
  {
    path: '/',
    route: mainRoutes as any
  },
];
