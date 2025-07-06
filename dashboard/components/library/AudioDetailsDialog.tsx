// Dialog per mostrare i dettagli audio di un libro

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";

type AudioMeta = {
  id: string;
  format?: string;
  bitrate?: string;
  duration?: string;
  size?: string;
  sampleRate?: string;
  channels?: string;
  [key: string]: any;
};

interface AudioDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  audio: AudioMeta | null;
  loading?: boolean;
}

function formatSeconds(sec?: string | number) {
  const s = Number(sec);
  if (isNaN(s)) return sec;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  let out = [];
  if (h > 0) out.push(`${h}h`);
  if (m > 0 || h > 0) out.push(`${m}min`);
  out.push(`${ss}sec`);
  return out.join(" ");
}

const fieldLabels: Record<string, string> = {
  format: "Formato",
  bitrate: "Bitrate",
  duration: "Durata",
  size: "Dimensione",
  sampleRate: "Sample Rate",
  channels: "Canali",
};

export const AudioDetailsDialog: React.FC<AudioDetailsDialogProps> = ({
  open,
  onClose,
  audio,
  loading,
}) => (
  <Dialog open={open} onOpenChange={open => !open && onClose()}>
    <DialogContent>
      <DialogTitle>Dettagli audio</DialogTitle>
      <DialogDescription>
        Visualizza i metadata audio associati al libro.
      </DialogDescription>
      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Caricamento...</div>
      ) : !audio ? (
        <div className="py-8 text-center text-muted-foreground">Nessun dato audio disponibile.</div>
      ) : (
        <div className="space-y-2">
          {"format" in audio && audio.format && (
            <div className="flex justify-between">
              <span className="font-medium">Formato</span>
              <span>
                <Badge variant="outline">{audio.format}</Badge>
              </span>
            </div>
          )}
          {"bitrate" in audio && audio.bitrate && (
            <div className="flex justify-between">
              <span className="font-medium">Bitrate</span>
              <span>
                <Badge variant="outline">{audio.bitrate}</Badge>
              </span>
            </div>
          )}
          {"duration" in audio && audio.duration && (
            <div className="flex justify-between">
              <span className="font-medium">Durata</span>
              <span>
                <Badge variant="outline">{formatSeconds(audio.duration)}</Badge>
              </span>
            </div>
          )}
          {"size" in audio && audio.size && (
            <div className="flex justify-between">
              <span className="font-medium">Dimensione</span>
              <span>
                <Badge variant="outline">{audio.size}</Badge>
              </span>
            </div>
          )}
          {"sampleRate" in audio && audio.sampleRate && (
            <div className="flex justify-between">
              <span className="font-medium">Sample Rate</span>
              <span>
                <Badge variant="outline">{audio.sampleRate}</Badge>
              </span>
            </div>
          )}
          {"channels" in audio && audio.channels && (
            <div className="flex justify-between">
              <span className="font-medium">Canali</span>
              <span>
                <Badge variant="outline">{audio.channels}</Badge>
              </span>
            </div>
          )}
        </div>
      )}
    </DialogContent>
  </Dialog>
);
