import { useProviderStore } from "@/stores/provider-store";
import { AIService } from "@/services/ai-service";
import { useEffect } from "react";

export function useModels() {
  const { activeProvider, updateProvider } = useProviderStore();

  useEffect(() => {
    if (activeProvider) {
      const fetchModels = async () => {
        try {
          const models = await AIService.fetchModels(activeProvider);
          updateProvider(activeProvider.id, { models });
          
          // If the currently selected model is not in the fetched list, set it to null
          if (activeProvider.selectedModel !== null && 
              !models.some(m => m.id === activeProvider.selectedModel)) {
            updateProvider(activeProvider.id, { selectedModel: null });
          }
        } catch (error) {
          console.error("Failed to fetch models:", error);
        }
      };

      fetchModels();
    }
  }, [activeProvider?.id]);

  return null;
}
