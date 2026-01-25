import ssl
import urllib3
import json
import re
import html
import cloudscraper
import feedparser

# Disable urllib3 warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
# Add your handle here. The script will try multiple mirrors.
HANDLE = "rswillif" 
MAX_POSTS = 10
OUTPUT_FILE = "data/posts.json"

# List of sources (RSS feeds)
INSTANCES = [
    "https://nitter.poast.org/{HANDLE}/rss",
    "https://nitter.privacydev.net/{HANDLE}/rss",
    "https://nitter.kavin.rocks/{HANDLE}/rss",
    "https://twitt.re/{HANDLE}/rss",
    "https://nitter.dashy.a3x.dn.nyx.im/{HANDLE}/rss",
    "https://openrss.org/x.com/{HANDLE}",
]

def clean_html(raw_html):
    """Remove HTML tags and decode entities for clean text."""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return html.unescape(cleantext)

def fetch_tweets():
    print(f"[*] Attempting to fetch tweets for @{HANDLE}...")
    
    # Create a CloudScraper instance
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'mobile': False
        }
    )
    
    # Add common headers to look legitimate
    scraper.headers.update({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://google.com',
        'Upgrade-Insecure-Requests': '1'
    })
    
    for instance_template in INSTANCES:
        url = instance_template.format(HANDLE=HANDLE)
        print(f"[*] Trying {url}...")
        
        try:
            # Use cloudscraper to fetch content
            response = scraper.get(url, timeout=15)
            
            if response.status_code != 200:
                print(f"[!] Error: HTTP {response.status_code}")
                continue
                
            feed = feedparser.parse(response.text)
            
            if feed.bozo and not feed.entries:
                print(f"[!] Failed to parse feed from {url}")
                continue
                
            if not feed.entries:
                print(f"[!] No entries found on {url}")
                continue
                
            print(f"[+] Successfully fetched {len(feed.entries)} tweets from {url}!")
            return feed.entries
            
        except Exception as e:
            print(f"[!] Error connecting to {url}: {e}")
            continue
            
    return None

def main():
    entries = fetch_tweets()
    
    if not entries:
        print("[-] All instances failed. Keeping existing data.")
        return

    posts = []
    for entry in entries[:MAX_POSTS]:
        content = entry.title
        is_repost = "RT by" in entry.author if 'author' in entry else False
        published = entry.published.split(" ")[0:4]
        date_str = " ".join(published)

        posts.append({
            "date": date_str,
            "content": content,
            "handle": f"@{HANDLE}",
            "isRepost": is_repost,
            "link": entry.link
        })

    json_data = json.dumps(posts, indent=2)
    
    with open(OUTPUT_FILE, "w") as f:
        f.write(json_data)
        
    print(f"[+] Successfully updated {OUTPUT_FILE} with {len(posts)} posts.")

if __name__ == "__main__":
    main()