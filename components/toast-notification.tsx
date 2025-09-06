"use client";

import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface ToastNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
}

export function ToastNotification({
  isOpen,
  onClose,
  type,
  title,
  message,
}: ToastNotificationProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, 4000); // Auto-dismiss after 4 seconds
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, onClose]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isOpen) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, 2000); // Resume with shorter timeout when mouse leaves
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-yellow-500";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className={`
        bg-white border-l-4 ${getBorderColor()} shadow-lg rounded-r-lg p-4 min-w-80 max-w-96
        animate-in slide-in-from-left-full fade-in duration-300
        ${
          !isOpen
            ? "animate-out slide-out-to-left-full fade-out duration-200"
            : ""
        }
      `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </h4>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-black hover:text-black" />
          </Button>
        </div>
      </div>
    </div>
  );
}
