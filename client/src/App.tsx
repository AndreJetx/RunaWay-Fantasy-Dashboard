import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Characters from "@/pages/characters";
import Inventory from "@/pages/inventory";
import Campaigns from "@/pages/campaigns";
import Maps from "@/pages/maps";
import Notes from "@/pages/notes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/characters" component={Characters} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/maps" component={Maps} />
      <Route path="/notes" component={Notes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
