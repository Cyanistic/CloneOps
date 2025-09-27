'use client';

import { useEffect, useRef, createContext, useContext, useReducer } from 'react';

// Define event types based on the backend SseEvent enum
type SseEvent = 
  | { type: 'newMessage'; data: any }
  | { type: 'newConversation'; data: any }
  | { type: 'editConversation'; data: any }
  | { type: 'usersAddedToConversation'; data: any };

// Create context for real-time events
interface RealtimeEventContextType {
  events: SseEvent[];
  addMessage: (message: any) => void;
  addConversation: (conversation: any) => void;
  updateConversation: (conversation: any) => void;
}

const RealtimeEventContext = createContext<RealtimeEventContextType | undefined>(undefined);

// Reducer to manage events state
type EventsState = SseEvent[];
type EventsAction = 
  | { type: 'ADD_EVENT'; payload: SseEvent }
  | { type: 'ADD_MESSAGE'; payload: any }
  | { type: 'ADD_CONVERSATION'; payload: any }
  | { type: 'UPDATE_CONVERSATION'; payload: any };

function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case 'ADD_EVENT':
      return [...state, action.payload];
    case 'ADD_MESSAGE':
      return [...state, { type: 'newMessage', data: action.payload }];
    case 'ADD_CONVERSATION':
      return [...state, { type: 'newConversation', data: action.payload }];
    case 'UPDATE_CONVERSATION':
      return [...state, { type: 'editConversation', data: action.payload }];
    default:
      return state;
  }
}

// Provider component
export function RealtimeEventProvider({ children }: { children: React.ReactNode }) {
  const [events, dispatch] = useReducer(eventsReducer, []);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource('/api/events', { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const eventData: SseEvent = JSON.parse(event.data);
        dispatch({ type: 'ADD_EVENT', payload: eventData });
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Helper functions to add specific types of events
  const addMessage = (message: any) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const addConversation = (conversation: any) => {
    dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
  };

  const updateConversation = (conversation: any) => {
    dispatch({ type: 'UPDATE_CONVERSATION', payload: conversation });
  };

  return (
    <RealtimeEventContext.Provider value={{ 
      events, 
      addMessage, 
      addConversation, 
      updateConversation 
    }}>
      {children}
    </RealtimeEventContext.Provider>
  );
}

// Custom hook to use the context
export function useRealtimeEvents() {
  const context = useContext(RealtimeEventContext);
  if (context === undefined) {
    throw new Error('useRealtimeEvents must be used within a RealtimeEventProvider');
  }
  return context;
}