import { AppProvider } from "@src/global/context/app";
import { ClockHandlerProvider } from "@src/global/context/clock-handler";
import { ComponentProps } from "@src/shared/@types/component-props";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient({});

export default function GlobalProvider({ children }: ComponentProps) {
   return (
      <QueryClientProvider client={queryClient}>
         <ThemeProvider attribute={"class"} enableSystem={true}>
            <AppProvider>
               <ClockHandlerProvider>
                  {children}
               </ClockHandlerProvider>
            </AppProvider>
         </ThemeProvider>
      </QueryClientProvider>
   );
}
