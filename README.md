# YouTube Channel Aggregator PWA

This is a Progressive Web App (PWA) that displays videos from one or more YouTube channels or playlists in a clean, tabbed interface. The app is configurable through a local `config.json` file and supports offline viewing of the basic app shell.

## Key Features

1.  **Progressive Web App (PWA)**
    *   Installable on mobile and desktop devices.
    *   Responsive design optimized for Android/iOS.
    *   Offline fallback page.
    *   "Add to Home Screen" support with a custom icon and name (via `manifest.json` and `icon.png`).

2.  **Settings Configuration (`config.json`)**
    *   App behavior is controlled by `config.json`.
    *   **`appTitle`**: Sets the title shown in the web app header and browser tab.
    *   **`channels`**: An array of objects, each representing a YouTube source to be displayed in a tab.
        *   `name`: The custom name for the tab.
        *   `url`: The URL of the YouTube channel or playlist.
            *   **Playlist URL Example**: `https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID`
            *   **Channel URL Example**: `https://www.youtube.com/channel/YOUR_CHANNEL_ID` (The app attempts to embed the channel's uploads, but providing a direct "uploads" playlist URL from the channel is often more reliable for embedding.)

    **Example `config.json`:**
    ```json
    {
      "appTitle": "My Tech Hub",
      "channels": [
        {
          "name": "Awesome Tech Reviews",
          "url": "https://www.youtube.com/playlist?list=PLQY2H8rRoyvz_mOaX3fDk2MDW4L7M23B-"
        },
        {
          "name": "Google Developers",
          "url": "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw"
        },
        {
          "name": "Latest Gaming News",
          "url": "https://www.youtube.com/playlist?list=PLpg6WLs8kxGO9fL0VAq7w2k5zH3dfp_Oc"
        }
      ]
    }
    ```

3.  **Multi-Channel / Playlist Tab Layout**
    *   Tabs are dynamically created based on the `channels` array in `config.json`.
    *   Users can switch between different content sources using these tabs.

4.  **YouTube Video Embedding**
    *   Videos are displayed using standard YouTube `<iframe>` embeds.
    *   For playlists, the playlist itself is embedded.
    *   For channels, the app attempts to embed a view of the channel's uploads. For best results, using the channel's specific "uploads" playlist URL is recommended if available.

## Technical Specifications

*   **Frontend**: HTML, Tailwind CSS (via CDN), Vanilla JavaScript
*   **PWA Features**: Web App Manifest (`manifest.json`), Service Worker (`service-worker.js`)
*   **Video Embeds**: Standard YouTube `<iframe>` embeds
*   **Configuration**: `config.json`

## How to Run

1.  **Clone/Download**: Get the source code files (`index.html`, `style.css`, `scripts.js`, `config.json`, `manifest.json`, `service-worker.js`, `offline.html`, `icon.png`).
2.  **Customize Configuration**:
    *   Edit `config.json` to set your desired `appTitle` and list of `channels` with their names and YouTube URLs.
    *   Replace `icon.png` with your own 512x512 pixel (or other sizes as specified in `manifest.json`) icon.
3.  **Host**: Deploy the files to any static file hosting service (e.g., GitHub Pages, Firebase Hosting, Netlify, Vercel, or a simple local HTTP server).
    *   For local testing, you can use a simple HTTP server. For example, if you have Python installed, navigate to the project directory in your terminal and run:
        *   Python 3: `python -m http.server`
        *   Python 2: `python -m SimpleHTTPServer`
    *   Then open your browser to `http://localhost:8000` (or the port indicated by the server).
    *   **Note**: Service workers require HTTPS to function, except for `localhost` for development purposes.

## Limitations

*   Video sorting and metadata (e.g., views, likes) are limited by YouTube's embed capabilities.
*   Directly embedding a channel's "latest uploads" feed via a simple channel URL can be unreliable as YouTube's support for this specific embed type (`listType=channel&list=CHANNEL_ID`) has varied. Using a specific playlist URL (e.g., the channel's "uploads" playlist) is generally more robust.
*   The full list of older videos may not be available if not included in the embedded playlist.
