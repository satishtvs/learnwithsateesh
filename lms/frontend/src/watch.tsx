import { useEffect, useRef, useState } from 'react'
import { reportWatch, type WatchResult } from './api'

/** Minimal slice of the YouTube IFrame Player API that we use. */
interface YTPlayer {
  getDuration(): number
  getPlaybackRate(): number
  destroy(): void
}
interface YTApi {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      host?: string
      playerVars?: Record<string, number | string>
      events?: {
        onReady?: () => void
        onStateChange?: (e: { data: number }) => void
      }
    },
  ) => YTPlayer
}
declare global {
  interface Window {
    YT?: YTApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTApi> | null = null
function loadYouTubeApi(): Promise<YTApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise<YTApi>((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        if (window.YT) resolve(window.YT)
      }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.onerror = () => {
        apiPromise = null
        reject(new Error('YouTube player could not load'))
      }
      document.head.appendChild(s)
    })
  }
  return apiPromise
}

const PLAYING = 1
const SEND_EVERY_S = 15

/**
 * The lesson video. For a signed-in student it counts the seconds actually played (seeking ahead earns nothing) and
 * reports them to the server, which decides when the video counts as watched. Everyone else gets a plain player.
 */
export function WatchedVideo({
  course,
  part,
  videoId,
  title,
  track,
  initialSeconds,
  knownDuration,
  onResult,
}: {
  course: string
  part: string
  videoId: string
  title: string
  track: boolean
  initialSeconds: number
  knownDuration: number | null
  onResult: (r: WatchResult) => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [duration, setDuration] = useState(knownDuration ?? 0)
  const [failed, setFailed] = useState(false)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    if (!track) return
    let player: YTPlayer | null = null
    let timer = 0
    let dead = false
    let playing = false
    let acc = initialSeconds // media seconds played, counting what the server already has
    let sent = initialSeconds
    let dur = 0
    let lastTick = 0

    const send = async () => {
      if (acc === sent || dur < 30) return
      const mine = acc
      sent = mine
      try {
        onResultRef.current(await reportWatch(course, part, mine, dur))
      } catch {
        sent = -1 // try again at the next tick
      }
    }
    const tick = () => {
      const now = Date.now()
      if (playing && player) {
        const rate = Math.min(player.getPlaybackRate() || 1, 2)
        acc += ((now - lastTick) / 1000) * rate
        if (dur) acc = Math.min(acc, dur)
        setSeconds(Math.floor(acc))
        if (acc - sent >= SEND_EVERY_S) void send()
      }
      lastTick = now
    }

    loadYouTubeApi()
      .then((YT) => {
        if (dead || !host.current) return
        const mount = document.createElement('div')
        host.current.appendChild(mount)
        player = new YT.Player(mount, {
          videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => {
              dur = player?.getDuration() || 0
              setDuration(dur)
            },
            onStateChange: (e) => {
              if (!dur && player) {
                dur = player.getDuration() || 0
                setDuration(dur)
              }
              lastTick = Date.now()
              playing = e.data === PLAYING
              // Reaching the end earns nothing by itself: only seconds really played count.
              if (e.data !== PLAYING) void send()
            },
          },
        })
        timer = window.setInterval(tick, 1000)
        lastTick = Date.now()
      })
      .catch(() => setFailed(true))

    const leaving = () => void send()
    window.addEventListener('pagehide', leaving)
    return () => {
      dead = true
      window.clearInterval(timer)
      window.removeEventListener('pagehide', leaving)
      void send()
      try {
        player?.destroy()
      } catch {
        /* already gone */
      }
      if (host.current) host.current.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, course, part, videoId])

  if (!track || failed) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )
  }
  const pct = duration ? Math.min(100, Math.round((100 * seconds) / duration)) : 0
  return (
    <>
      <div className="video" ref={host} aria-label={title} />
      {duration > 0 && <p className="muted small watch-note">Watched {pct}%. The video counts once you have watched at least 90%.</p>}
    </>
  )
}
