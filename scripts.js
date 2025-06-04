document.addEventListener('DOMContentLoaded', () => {
    const appTitleElement = document.getElementById('appTitle');
    const tabsContainer = document.getElementById('tabsContainer');
    const contentContainer = document.getElementById('contentContainer');
    let activeTab = null;

    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            // Set App Title
            if (config.appTitle) {
                document.title = config.appTitle;
                appTitleElement.textContent = config.appTitle;
            }

            // Create Tabs and Content Panes
            if (config.channels && config.channels.length > 0) {
                config.channels.forEach((channel, index) => {
                    // Create Tab Button
                    const tabButton = document.createElement('button');
                    tabButton.className = 'py-2 px-4 font-semibold rounded-lg focus:outline-none';
                    tabButton.textContent = channel.name || `Channel ${index + 1}`;
                    tabButton.dataset.channelIndex = index;

                    // Create Content Pane (iframe container)
                    const contentPane = document.createElement('div');
                    contentPane.className = 'video-content-pane hidden'; // Hidden by default
                    contentPane.id = `content-pane-${index}`;

                    let embedUrl = '';
                    if (channel.url.includes('playlist?list=')) {
                        const playlistId = new URL(channel.url).searchParams.get('list');
                        embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
                    } else if (channel.url.includes('/channel/')) {
                        const channelId = channel.url.substring(channel.url.lastIndexOf('/') + 1);
                        // Note: YouTube removed the ability to embed a channel's latest videos directly
                        // using a simple channel ID embed for "uploads".
                        // A common workaround is to link to the channel's "uploads" playlist if known,
                        // or just link to the channel page.
                        // For this example, we'll create an embed for the channel's videos page,
                        // which isn't ideal as it's not a direct feed embed.
                        // A better solution would involve the YouTube Data API, which is outside the scope here.
                        // For now, let's assume we might have a playlist for recent uploads.
                        // We'll use a placeholder iframe or a message if a direct feed isn't possible.
                        // The user should ideally provide a playlist URL for channels for best results.

                        // Fallback: creating an iframe that shows uploads from a channel using the channelId.
                        // This specific format `https://www.youtube.com/embed?listType=channel&list=${channelId}` is unofficial
                        // and might not work consistently or could be deprecated.
                        // The most reliable way for channel content is for the user to provide the "uploads" playlist URL.
                        embedUrl = `https://www.youtube.com/embed?listType=channel&list=${channelId}`;
                        // If the above doesn't work as expected, a message could be shown.
                        // For a more robust solution, one would use the YouTube Data API to fetch the uploads playlist ID.
                    } else {
                        console.warn(`Unsupported YouTube URL format: ${channel.url}. Please use a playlist or channel URL.`);
                        contentPane.innerHTML = `<p class="text-red-500">Unsupported YouTube URL format for "${channel.name}". Please use a valid playlist or channel URL.</p>`;
                    }

                    if (embedUrl) {
                        const iframe = document.createElement('iframe');
                        iframe.width = '100%';
                        iframe.height = '500'; // Default height, can be adjusted via CSS
                        iframe.src = embedUrl;
                        iframe.frameBorder = '0';
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        iframe.allowFullscreen = true;
                        contentPane.appendChild(iframe);
                    }

                    contentContainer.appendChild(contentPane);

                    // Tab Click Event
                    tabButton.addEventListener('click', () => {
                        // Deactivate previous tab
                        if (activeTab) {
                            activeTab.button.classList.remove('bg-red-500', 'text-white');
                            activeTab.button.classList.add('bg-gray-200', 'text-gray-700'); // Assuming default style
                            activeTab.pane.classList.add('hidden');
                        }
                        // Activate new tab
                        tabButton.classList.add('bg-red-500', 'text-white');
                        tabButton.classList.remove('bg-gray-200', 'text-gray-700');
                        contentPane.classList.remove('hidden');

                        activeTab = { button: tabButton, pane: contentPane };
                    });

                    tabsContainer.appendChild(tabButton);

                    // Activate the first tab by default
                    if (index === 0) {
                        tabButton.click();
                    } else {
                         tabButton.classList.add('bg-gray-200', 'text-gray-700');
                    }
                });
            } else {
                contentContainer.innerHTML = '<p>No channels configured. Please check your config.json file.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading or parsing config.json:', error);
            appTitleElement.textContent = 'Error Loading Config';
            contentContainer.innerHTML = '<p>Error loading configuration. Please ensure config.json is present and correctly formatted.</p>';
        });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
