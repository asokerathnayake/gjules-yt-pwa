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
                    let embedUrl = '';
                    let CId = ''; // To store extracted Channel ID if applicable
                    const contentPane = document.createElement('div');
                    contentPane.className = 'video-content-pane hidden'; // Hidden by default
                    contentPane.id = `content-pane-${index}`;

                    if (channel.url.includes('playlist?list=')) {
                        const playlistId = new URL(channel.url).searchParams.get('list');
                        embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
                    } else if (channel.url.includes('/channel/')) {
                        CId = channel.url.substring(channel.url.lastIndexOf('/') + 1);
                        if (CId.startsWith('UC')) {
                             embedUrl = `https://www.youtube.com/embed/videoseries?list=${CId.replace(/^UC/, 'UU')}`;
                        } else {
                             // If it's not a standard UC channel ID, this might not work as expected.
                             // Fallback to listType=channel, though it's less reliable.
                             embedUrl = `https://www.youtube.com/embed?listType=channel&list=${CId}`;
                             console.warn(`Channel URL ${channel.url} for "${channel.name}" does not have a standard 'UC' prefix. Attempting listType=channel embed, which may be unreliable. Consider using the channel's 'uploads' playlist URL directly.`);
                        }
                    } else if (channel.url.includes('/c/')) {
                        // For /c/ custom URLs, extracting a reliable channel ID to form a UU playlist is hard without API.
                        // We will attempt to use the listType=channel method with the custom name.
                        // This is often unreliable. Best to use playlist or /channel/UC... URL.
                        const customUrlPart = channel.url.substring(channel.url.lastIndexOf('/c/') + 3);
                        embedUrl = `https://www.youtube.com/embed?listType=channel&list=${customUrlPart}`;
                        console.warn(`Channel URL ${channel.url} for "${channel.name}" is a /c/ custom URL. Attempting listType=channel embed, which can be unreliable. Best to use the channel's 'uploads' playlist URL or /channel/UC... URL directly.`);
                    } else if (channel.url.includes('/@')) {
                        // For /@handle URLs, direct embedding is not reliably supported.
                        contentPane.innerHTML = `<div class="p-4 text-center">
                            <p class="font-semibold text-lg">Cannot directly embed from "/@handle" URLs.</p>
                            <p class="mt-2 text-gray-700">For the channel "${channel.name}", please update <code>config.json</code> with its specific "uploads" playlist URL or a standard <code>/channel/UC...</code> URL.</p>
                            <p class="mt-1 text-sm text-gray-500">Example playlist URL: <code>https://www.youtube.com/playlist?list=UU...</code> (replace UU with UC from channel ID).</p>
                        </div>`;
                        embedUrl = null; // Prevent iframe creation
                    } else {
                        console.warn(`Unsupported YouTube URL format: ${channel.url} for channel "${channel.name}".`);
                        contentPane.innerHTML = `<p class="text-red-500">Unsupported YouTube URL format for "${channel.name}". Please use a valid playlist, /channel/UC..., or /c/... URL. '/@handle' URLs require manual playlist configuration.</p>`;
                        embedUrl = null; // Prevent iframe creation
                    }

                    if (embedUrl) {
                        const iframe = document.createElement('iframe');
                        iframe.width = '100%';
                        iframe.height = '500'; // Default height
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
