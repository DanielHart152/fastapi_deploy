declare global {
  interface Window {
    mediaControls?: {
      seekToTime: (time: number) => void
      playMedia: () => void
      pauseMedia: () => void
    }
  }
}

export {}