const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const readline = require('readline');

const CONFIG = {
    static: 'https://static.kogstatic.com/',
    dev: 'https://dev.kogstatic.com/'
};

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mp3', '.wav', '.ogg']);

function sanitize(name) {
    return name.replace(/[<>:"/\\|?*]/g, '_');
}

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, (ans) => {
        rl.close();
        resolve(ans.toLowerCase().trim());
    }));
}

async function downloadFiles() {
    const choice = await ask('Download from (dev/static)? ');
    const baseUrl = CONFIG[choice];

    if (!baseUrl) {
        console.error('Invalid environment selected.');
        return;
    }

    const outputDir = path.join(__dirname, 'downloads', choice);
    let isTruncated = true;
    let nextMarker = null;

    try {
        while (isTruncated) {
            const listUrl = nextMarker 
                ? `${baseUrl}?marker=${encodeURIComponent(nextMarker)}` 
                : baseUrl;
            
            const response = await axios.get(listUrl);
            const result = await (new xml2js.Parser()).parseStringPromise(response.data);
            const bucketData = result.ListBucketResult;
            const contents = bucketData.Contents;

            if (!contents) break;

            for (const item of contents) {
                const key = item.Key[0];
                const ext = path.extname(key).toLowerCase();

                if (key.endsWith('/') || !ALLOWED_EXTENSIONS.has(ext)) continue;

                const parts = key.split('/').map(sanitize);
                const fileName = parts.pop();
                const subDirs = path.join(outputDir, ...parts);
                const localFilePath = path.join(subDirs, fileName);

                if (fs.existsSync(subDirs) && !fs.lstatSync(subDirs).isDirectory()) {
                    fs.renameSync(subDirs, subDirs + '_old');
                }

                fs.mkdirSync(subDirs, { recursive: true });

                try {
                    const fileResponse = await axios({
                        url: `${baseUrl}${encodeURIComponent(key).replace(/%2F/g, '/')}`,
                        method: 'GET',
                        responseType: 'stream',
                        timeout: 30000
                    });

                    await pipeline(fileResponse.data, fs.createWriteStream(localFilePath));
                    
                    const mtime = new Date(item.LastModified[0]);
                    fs.utimesSync(localFilePath, mtime, mtime);
                    console.log(`Saved: ${key}`);
                } catch (err) {
                    console.error(`Failed ${key}: ${err.message}`);
                }
            }

            isTruncated = bucketData.IsTruncated && bucketData.IsTruncated[0] === 'true';
            if (isTruncated) {
                nextMarker = contents[contents.length - 1].Key[0];
            }
        }
        console.log('Task finished.');
    } catch (error) {
        console.error('Fatal:', error.message);
    }
}

downloadFiles();
