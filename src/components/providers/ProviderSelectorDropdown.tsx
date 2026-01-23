import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useProviderStore } from "@/stores/provider-store";
import { useUIStore } from "@/stores/ui-store";
import { ProviderCard } from "./ProviderCard";
import { Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProviderSelectorDropdown({ open, onOpenChange }: Props) {
  const { providers, activeProvider, setActiveProvider } = useProviderStore();
  const { setSettingsOpen } = useUIStore();

  const handleSelectProvider = (provider: typeof activeProvider) => {
    if (provider) {
      setActiveProvider(provider);
      onOpenChange(false);
    }
  };

  const handleAddProvider = () => {
    onOpenChange(false);
    setSettingsOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select AI Provider</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {providers.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">No providers configured yet.</p>
              <Button onClick={handleAddProvider}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Provider
              </Button>
            </div>
          ) : (
            <>
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isActive={activeProvider?.id === provider.id}
                  onSelect={() => handleSelectProvider(provider)}
                  showActions={false}
                />
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={handleAddProvider}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Provider
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
