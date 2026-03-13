
import https from 'https';

const WIKI_URL = 'https://zh.minecraft.wiki/w/%E7%94%9F%E7%89%A9';

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function main() {
    const html = await fetchPage(WIKI_URL);
    // Find index of "猪"
    const index = html.indexOf('title="猪"');
    if (index !== -1) {
        console.log('Snippet around "猪":');
        console.log(html.substring(index - 200, index + 200));
    } else {
        console.log('"猪" not found in HTML.');
    }
    
    const imgIndex = html.indexOf('<img');
    if (imgIndex !== -1) {
        console.log('First img tag:');
        console.log(html.substring(imgIndex, imgIndex + 200));
    }
}

main();
