"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/VStack";

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export function ErrorCard({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  onSecondaryAction,
  secondaryActionLabel = "Upload another file",
}: ErrorCardProps) {
  return (
    <Card
      variant="default"
      elevation="low"
      padding={6}
      className="mx-auto max-w-md animate-fade-in text-center shadow-soft"
    >
      <VStack gap={4} hAlign="center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </span>
        <VStack gap={1} hAlign="center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </VStack>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onRetry && <Button label={retryLabel} variant="primary" onClick={onRetry} />}
          {onSecondaryAction && (
            <Button label={secondaryActionLabel} variant="secondary" onClick={onSecondaryAction} />
          )}
        </div>
      </VStack>
    </Card>
  );
}
