"use client";

import { useRef, useState } from "react";
import {
  ImagePlus,
  LoaderCircle,
  Paperclip,
  SendHorizontal,
  TriangleAlert,
} from "lucide-react";

import { useAppState } from "@/components/providers/app-provider";
import { AttachmentChip } from "@/components/files/attachment-chip";
import { Button } from "@/components/ui/button";
import {
  parseServerAttachments,
  prepareClientAttachment,
  splitFilesByParser,
  validateFiles,
} from "@/lib/files/client";
import { inferVisionSupport } from "@/lib/ollama/models";
import type { AttachmentRecord, ImageHandlingMode } from "@/types/app";

export function ChatComposer() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [composerError, setComposerError] = useState("");
  const [forceImageMode, setForceImageMode] = useState(false);
  const {
    selectedModel,
    setSelectedModel,
    models,
    modelsLoading,
    refreshModels,
    sendMessage,
    isStreaming,
    connectionStatus,
  } = useAppState();

  const supportsImagesGuess = inferVisionSupport({
    name: selectedModel,
    details: models.find((model) => model.name === selectedModel)?.details ?? null,
  });

  async function ingestFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) {
      return;
    }

    const existingBytes = attachments.reduce((sum, attachment) => sum + attachment.size, 0);
    const validationError = validateFiles(files, existingBytes);
    if (validationError) {
      setComposerError(validationError);
      return;
    }

    setComposerError("");
    setIsProcessingFiles(true);

    try {
      const { clientFiles, serverFiles } = splitFilesByParser(files);
      const clientAttachments = await Promise.all(
        clientFiles.map((file) => prepareClientAttachment(file)),
      );
      const serverAttachments = serverFiles.length
        ? await parseServerAttachments(serverFiles)
        : [];

      setAttachments((current) => [...current, ...clientAttachments, ...serverAttachments]);
    } catch (error) {
      setComposerError(
        error instanceof Error ? error.message : "Unable to process uploaded files.",
      );
    } finally {
      setIsProcessingFiles(false);
    }
  }

  async function handleSubmit() {
    const fallbackText =
      draft.trim() || (attachments.length ? "Please use the attached files as context." : "");

    if (!fallbackText || isStreaming) {
      return;
    }

    const imageMode: ImageHandlingMode = forceImageMode ? "force" : "auto";
    const nextAttachments = attachments;

    setDraft("");
    setAttachments([]);
    setComposerError("");
    setForceImageMode(false);

    await sendMessage({
      text: fallbackText,
      attachments: nextAttachments,
      imageMode,
    });
  }

  const hasImageAttachments = attachments.some((attachment) => attachment.kind === "image");
  const showImageNote = hasImageAttachments && !supportsImagesGuess;

  return (
    <div className="border-t border-stroke bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-muted)_58%,transparent),transparent)] px-4 py-4 md:px-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="token-pill flex items-center rounded-[18px] px-3.5 py-2.5">
            <label className="mr-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="bg-transparent pr-1 text-sm font-semibold tracking-[-0.01em] text-ink outline-none"
            >
              {!models.length ? <option value="">No models</option> : null}
              {models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => void refreshModels()}
            disabled={modelsLoading}
            className="token-pill rounded-[18px]"
          >
            {modelsLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Refresh models
          </Button>

          <div className="token-pill rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            {isStreaming
              ? "Streaming..."
              : connectionStatus === "connected"
              ? "Ready to send"
              : connectionStatus === "connecting"
                ? "Connecting..."
                : "Disconnected"}
          </div>
        </div>

        <p className="text-xs leading-6 text-muted">
          Press <span className="text-ink">Enter</span> to send and{" "}
          <span className="text-ink">Shift + Enter</span> for a new line.
        </p>
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) {
            setDragActive(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          void ingestFiles(event.dataTransfer.files);
        }}
        className={`panel-muted rounded-[30px] p-4 transition ${
          dragActive
            ? "border-brand/45 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-soft)_100%,transparent),color-mix(in_srgb,var(--surface-muted)_84%,transparent))] shadow-float"
            : "hover:border-strokeStrong"
        }`}
      >
        {attachments.length ? (
          <div className="mb-4 flex flex-wrap gap-3">
            {attachments.map((attachment) => (
              <AttachmentChip
                key={attachment.id}
                attachment={attachment}
                onRemove={() =>
                  setAttachments((current) =>
                    current.filter((entry) => entry.id !== attachment.id),
                  )
                }
              />
            ))}
          </div>
        ) : null}

        {showImageNote ? (
          <label className="mb-4 flex items-start gap-3 rounded-[22px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1 leading-6">
              This model does not look like a vision-capable Ollama model. You can
              still preview images here, or send them anyway if you know the model
              supports image understanding.
            </span>
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={forceImageMode}
                onChange={(event) => setForceImageMode(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent"
              />
              Send anyway
            </span>
          </label>
        ) : null}

        {composerError ? (
          <p className="mb-4 rounded-[22px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {composerError}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder="Message your remote Ollama model..."
            className="field focus-ring min-h-[132px] flex-1 rounded-[26px] px-4 py-4 text-sm leading-7 text-ink outline-none placeholder:text-muted"
          />

          <div className="flex flex-col gap-3 lg:w-60">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept=".txt,.md,.csv,.json,.pdf,.docx,.png,.jpg,.jpeg,.gif,.webp,.bmp"
              onChange={(event) => {
                if (event.target.files) {
                  void ingestFiles(event.target.files);
                }
                event.target.value = "";
              }}
            />

            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFiles}
              className="justify-start rounded-[20px]"
            >
              {isProcessingFiles ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              Upload files
            </Button>

            <div className="rounded-[22px] border border-dashed border-strokeStrong bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-solid)_62%,transparent),color-mix(in_srgb,var(--surface-muted)_82%,transparent))] px-4 py-3 text-xs leading-6 text-muted">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <ImagePlus className="h-4 w-4 text-brand" />
                Drag and drop files here
              </div>
              <p className="mt-1 text-muted">
                Supports txt, md, csv, json, pdf, docx, and common images.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={() => void handleSubmit()}
              disabled={
                isStreaming ||
                isProcessingFiles ||
                (!draft.trim() && attachments.length === 0) ||
                !selectedModel
              }
              className="justify-center rounded-[20px] py-3.5"
            >
              {isStreaming ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
