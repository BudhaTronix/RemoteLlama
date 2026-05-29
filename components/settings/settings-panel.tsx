"use client";

import { RotateCw } from "lucide-react";

import { useAppState } from "@/components/providers/app-provider";
import { ConnectionForm } from "@/components/settings/connection-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { getDefaultConnection } from "@/lib/ollama/connection";

export function SettingsPanel() {
  const {
    connection,
    settingsOpen,
    setSettingsOpen,
    saveConnection,
    testConnection,
    refreshModels,
    modelsLoading,
  } = useAppState();

  return (
    <Modal
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Connection settings"
    >
      <div className="space-y-5">
        <ConnectionForm
          initialConnection={connection ?? getDefaultConnection()}
          title="Remote Ollama host"
          description="Update the saved host, protocol, or port. OllaBridge uses these details for all proxy calls."
          submitLabel="Save changes"
          onSubmit={async (nextConnection) => {
            const result = await saveConnection(nextConnection);
            setSettingsOpen(false);
            return result;
          }}
          onTest={(nextConnection) => testConnection(nextConnection)}
        />

        <div className="panel-muted flex items-center justify-between rounded-[24px] px-4 py-4">
          <div>
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              Model catalog
            </p>
            <p className="text-sm text-muted">
              Refresh the available models from the current Ollama host.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void refreshModels()}
            disabled={modelsLoading}
          >
            {modelsLoading ? <Spinner /> : <RotateCw className="h-4 w-4" />}
            Refresh models
          </Button>
        </div>
      </div>
    </Modal>
  );
}
