import { createContext, useContext, ReactNode } from 'react';

interface TimezoneContextType {
  timezone: string;
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export const useTimezone = () => useContext(TimezoneContext);

export const TimezoneProvider = ({ children }: { children: ReactNode }) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <TimezoneContext.Provider value={{ timezone }}>
      {children}
    </TimezoneContext.Provider>
  );
};
