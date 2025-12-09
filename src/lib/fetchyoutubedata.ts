export type FetchYoutubeDataResult = {
  videoId: string;
  title: string;
  description: string;
  author: string;
  authorUrl: string;
  viewCount: string;
  likeCount?: string;
  keywords?: string[];
  category?: string;
  uploadDate?: string;
  links?: Record<string, string>;
  transcript?: Array<{
    startTime: string;
    text: string;
  }>;
};

// Regex patterns for extracting video IDs - defined at top level for performance
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
];

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(input: string): string | null {
  // If it's already just a video ID (11 characters)
  if (VIDEO_ID_PATTERN.test(input)) {
    return input;
  }

  // Try to extract from various URL formats
  for (const pattern of URL_PATTERNS) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

// Fetch YouTube video details
async function fetchVideoDetails(videoId: string): Promise<{
  title: string;
  description: string;
  author: string;
  authorUrl: string;
  viewCount: string;
  likeCount?: string;
  keywords?: string[];
  category?: string;
  uploadDate?: string;
  links?: Record<string, string>;
}> {
  const data = JSON.stringify({
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20230327.07.00",
      },
    },
    videoId,
  });

  const response = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language":
        "nb,nb-NO;q=0.9,no;q=0.8,nn;q=0.7,en-US;q=0.6,en;q=0.5",
      "content-type": "application/json",
      origin: "https://www.youtube.com",
      referer: `https://www.youtube.com/watch?v=${videoId}`,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video details: ${response.statusText}`);
  }

  const result = await response.json() as any;

  const videoDetails = result.videoDetails;
  const microformat = result.microformat?.playerMicroformatRenderer;

  // Extract links from description if possible
  const links: Record<string, string> = {};
  if (microformat?.canonicalUrl) {
    links.canonical = microformat.canonicalUrl;
  }
  if (microformat?.ownerProfileUrl) {
    links.ownerProfile = microformat.ownerProfileUrl;
  }

  return {
    title: videoDetails?.title || "Unknown",
    description:
      videoDetails?.shortDescription ||
      microformat?.description?.simpleText ||
      "",
    author: videoDetails?.author || "Unknown",
    authorUrl: microformat?.ownerProfileUrl || "",
    viewCount: videoDetails?.viewCount || "0",
    likeCount: videoDetails?.likeCount,
    keywords: videoDetails?.keywords,
    category: microformat?.category,
    uploadDate: microformat?.uploadDate,
    links,
  };
}

// Fetch YouTube video transcript
async function fetchTranscript(
  videoId: string
): Promise<Array<{ startTime: string; text: string }>> {
  const data = JSON.stringify({
    context: {
      client: {
        hl: "en",
        gl: "US",
        deviceMake: "",
        deviceModel: "",
        clientName: "WEB",
        clientVersion: "2.20250927.00.01",
        osName: "Windows",
        osVersion: "10.0",
        originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        platform: "DESKTOP",
        clientFormFactor: "UNKNOWN_FORM_FACTOR",
        userInterfaceTheme: "USER_INTERFACE_THEME_DARK",
        timeZone: "America/New_York",
        browserName: "Chrome",
        browserVersion: "126.0.0.0",
        acceptHeader:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        screenWidthPoints: 2274,
        screenHeightPoints: 1271,
        screenPixelDensity: 1,
        screenDensityFloat: 1,
        utcOffsetMinutes: -240,
        connectionType: "CONN_CELLULAR_4G",
        memoryTotalKbytes: "8000000",
        mainAppWebInfo: {
          graftUrl: `https://www.youtube.com/watch?v=${videoId}`,
          pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_CAN_BE_INSTALLED",
          webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
          isWebNativeShareAvailable: true,
        },
      },
      user: {
        lockedSafetyMode: false,
      },
      request: {
        useSsl: true,
        internalExperimentFlags: [],
        consistencyTokenJars: [],
      },
    },
    params:
      "CgskezVhcDhwTlNlRRIOQ2dBU0FtVnVHZ0ElM0QYASozZW5nYWdlbWVudC1wYW5lbC1zZWFyY2hhYmxlLXRyYW5zY3JpcHQtc2VhcmNoLXBhbmVsMAE4AUAB",
    externalVideoId: videoId,
  });

  const response = await fetch(
    "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language":
          "nb,nb-NO;q=0.9,no;q=0.8,nn;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "application/json",
        origin: "https://www.youtube.com",
        referer: `https://www.youtube.com/watch?v=${videoId}`,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "same-origin",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "x-origin": "https://www.youtube.com",
        "x-youtube-client-name": "1",
      },
      body: data,
    }
  );

  // Transcript might not be available
  if (!response.ok) {
    return [];
  }

  const result = await response.json() as any;

  // Extract transcript segments
  const segments: Array<{ startTime: string; text: string }> = [];

  const actions = result.actions || [];
  for (const action of actions) {
    const transcriptRenderer =
      action.updateEngagementPanelAction?.content?.transcriptRenderer;
    const initialSegments =
      transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body
        ?.transcriptSegmentListRenderer?.initialSegments || [];

    for (const segment of initialSegments) {
      const renderer = segment.transcriptSegmentRenderer;
      if (renderer) {
        const startTime = renderer.startTimeText?.simpleText || "0:00";
        const text = renderer.snippet?.runs?.[0]?.text || "";

        if (text) {
          segments.push({
            startTime,
            text: text.replace(/\n/g, " "),
          });
        }
      }
    }
  }

  return segments;
}

export async function fetchYoutubeData(
  input: string
): Promise<FetchYoutubeDataResult> {
  if (!input?.trim()) {
    throw new Error("YouTube URL or video ID is required");
  }

  const videoId = extractVideoId(input.trim());
  if (!videoId) {
    throw new Error("Invalid YouTube URL or video ID");
  }

  try {
    // Fetch video details and transcript in parallel
    const [details, transcript] = await Promise.all([
      fetchVideoDetails(videoId),
      fetchTranscript(videoId).catch(() => []), // Don't fail if transcript is unavailable
    ]);

    return {
      videoId,
      ...details,
      transcript: transcript.length > 0 ? transcript : undefined,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("Network"))
    ) {
      throw new Error(
        "Failed to fetch YouTube data. Please check your internet connection."
      );
    }

    throw new Error(
      `Failed to fetch YouTube data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
