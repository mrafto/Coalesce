declare module 'yt-search' {
  export interface VideoSearchResult {
    videoId: string;
    title: string;
    url: string;
    thumbnail: string;
    seconds: number;
    timestamp: string;
    duration: {
      toString(): string;
    };
    author: {
      name: string;
      url: string;
    };
    views: number;
  }

  export interface SearchResult {
    videos: VideoSearchResult[];
    playlists: any[];
    accounts: any[];
    live: any[];
  }

  function search(query: string | { videoId: string }): Promise<SearchResult>;
  
  export default search;
}

