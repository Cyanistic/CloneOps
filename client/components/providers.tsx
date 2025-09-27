'use client';

import { RealtimeEventProvider } from '@/components/realtime-event-handler';
import { SessionProvider } from '@/components/session-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RealtimeEventProvider>
        {children}
      </RealtimeEventProvider>
    </SessionProvider>
  );
}