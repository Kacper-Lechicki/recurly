import { router } from 'expo-router';

type SessionLike = { currentTask?: unknown } | null | undefined;

export function navigateAfterFinalize(session?: SessionLike) {
  if (session?.currentTask) {
    router.replace({
      pathname: '/session-task',
      params: { task: String(session.currentTask) },
    });
    return;
  }

  router.replace('/');
}
