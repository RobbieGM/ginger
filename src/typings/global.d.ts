import { Server } from 'http';
import { ChildProcess } from 'child_process';

type ShareData = {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
};

declare global {
  interface Navigator {
    share?: (data?: ShareData) => Promise<void>;
    canShare?: (data?: ShareData) => boolean;
  }
}
