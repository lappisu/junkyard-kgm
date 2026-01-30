const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const readline = require('readline');

const CONFIG = {
    static: 'https://static.kogstatic.com/',
    dev: 'https://dev.kogstatic.com/',
    test: 'https://test.kogstatic.com/' 
};

const ALLOWED_EXTENSIONS = new Set(['.js', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mp3', '.wav', '.ogg']);
const CONCURRENCY = 10;

const SKIP_PATTERNS = /manifest/i;

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

function shouldSkipFile(localPath, remoteSize, remoteDate) {
    if (!fs.existsSync(localPath)) return false;
    
    const stats = fs.statSync(localPath);
    const localSize = stats.size;
    const localMtime = stats.mtime.getTime();
    const remoteMtime = new Date(remoteDate).getTime();
    
    return localSize === parseInt(remoteSize) && Math.abs(localMtime - remoteMtime) < 1000;
}

async function downloadFile(baseUrl, item, outputDir) {
    const key = item.Key[0];
    const ext = path.extname(key).toLowerCase();
    if (key.endsWith('/') || SKIP_PATTERNS.test(key)) {
        return null;
    }
    
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return { key, status: 'skipped', reason: 'extension not allowed' };
    }
    
    const parts = key.split('/').map(sanitize);
    const fileName = parts.pop();
    const subDirs = path.join(outputDir, ...parts);
    const localFilePath = path.join(subDirs, fileName);
    
    if (shouldSkipFile(localFilePath, item.Size[0], item.LastModified[0])) {
        return { key, status: 'skipped', reason: 'already exists with same size/date' };
    }
    
    if (fs.existsSync(subDirs) && !fs.lstatSync(subDirs).isDirectory()) {
        const backupPath = subDirs + '_old';
        console.log(`Warning: ${subDirs} is not a directory, backing up to ${backupPath}`);
        fs.renameSync(subDirs, backupPath);
    }
    
    if (!fs.existsSync(subDirs)) {
        fs.mkdirSync(subDirs, { recursive: true });
    }
    
    try {
        const fileResponse = await axios({
            url: `${baseUrl}${encodeURI(key)}`, // Encode the key to handle special characters
            method: 'GET',
            responseType: 'stream',
            timeout: 60000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const writer = fs.createWriteStream(localFilePath);
        await pipeline(fileResponse.data, writer);
        
        const mtime = new Date(item.LastModified[0]);
        fs.utimesSync(localFilePath, mtime, mtime);
        
        return { key, status: 'downloaded' };
    } catch (err) {
        return { 
            key, 
            status: 'failed', 
            error: err.message,
            code: err.code || 'UNKNOWN'
        };
    }
}

async function processQueue(queue, baseUrl, outputDir) {
    const results = { 
        downloaded: 0, 
        skipped: 0, 
        failed: 0,
        failedItems: []
    };

    for (let i = 0; i < queue.length; i += CONCURRENCY) {
        const batch = queue.slice(i, i + CONCURRENCY);
        const promises = batch.map(item => downloadFile(baseUrl, item, outputDir));
        
        const batchResults = await Promise.allSettled(promises);
        
        for (let j = 0; j < batchResults.length; j++) {
            const result = batchResults[j];
            
            if (result.status === 'fulfilled' && result.value) {
                const item = result.value;
                
                if (item.status === 'downloaded') {
                    results.downloaded++;
                    console.log(`✓ ${item.key}`);
                } else if (item.status === 'skipped') {
                    results.skipped++;
                } else if (item.status === 'failed') {
                    results.failed++;
                    results.failedItems.push(item.key);
                    console.error(`✗ ${item.key}: ${item.error} (${item.code || 'no code'})`);
                }
            } else if (result.status === 'rejected') {
                results.failed++;
                const key = batch[j]?.Key?.[0] || 'unknown';
                results.failedItems.push(key);
                console.error(`✗ ${key}: Promise rejected - ${result.reason?.message || 'Unknown error'}`);
            }
        }
        
        const processed = Math.min(i + CONCURRENCY, queue.length);
        console.log(`Progress: ${processed}/${queue.length} (↓${results.downloaded} ≈${results.skipped} ✗${results.failed})`);
    }
    
    return results;
}

async function downloadFiles() {
    const choice = await ask('Download from (dev/static/test)? ');
    const baseUrl = CONFIG[choice];
    
    if (!baseUrl) {
        console.error('Invalid environment selected. Choose from: dev, static, or test');
        return;
    }
    
    const outputDir = path.join(__dirname, 'downloads', choice);
    console.log(`Downloading from: ${baseUrl}`);
    console.log(`Saving to: ${outputDir}`);
    
    let allFiles = [];
    let isTruncated = true;
    let nextMarker = null;
    let page = 1;
    
    console.log('\nFetching file list...');
    
    try {
        while (isTruncated) {
            let listUrl;
            if (nextMarker) {
                listUrl = `${baseUrl}?marker=${encodeURIComponent(nextMarker)}`;
            } else {
                listUrl = baseUrl;
            }
            
            console.log(`Fetching page ${page}...`);
            
            const response = await axios.get(listUrl, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const result = await (new xml2js.Parser()).parseStringPromise(response.data);
            const bucketData = result.ListBucketResult;
            
            if (!bucketData || !bucketData.Contents) {
                console.log('No files found or empty bucket.');
                break;
            }
            
            const contents = bucketData.Contents;
            allFiles = allFiles.concat(contents);
            
            console.log(`Page ${page}: Found ${contents.length} items (Total: ${allFiles.length})`);
            
            isTruncated = bucketData.IsTruncated && bucketData.IsTruncated[0] === 'true';
            if (isTruncated && contents.length > 0) {
                nextMarker = contents[contents.length - 1].Key[0];
                page++;
            } else {
                isTruncated = false;
            }
        }
        
        console.log(`\nTotal items fetched: ${allFiles.length}`);
        
        if (allFiles.length === 0) {
            console.log('No files to download.');
            return;
        }
        const filesToDownload = allFiles.filter(item => {
            const key = item.Key[0];
            const ext = path.extname(key).toLowerCase();
            return !key.endsWith('/') && 
                   !SKIP_PATTERNS.test(key) && 
                   ALLOWED_EXTENSIONS.has(ext);
        });
        
        console.log(`Files to download (after filtering): ${filesToDownload.length}`);
        console.log('Starting downloads...\n');
        
        const results = await processQueue(filesToDownload, baseUrl, outputDir);
        
        console.log('\n=== Summary ===');
        console.log(`Downloaded: ${results.downloaded}`);
        console.log(`Skipped (already exist): ${results.skipped}`);
        console.log(`Failed: ${results.failed}`);
        
        if (results.failed > 0 && results.failedItems.length > 0) {
            console.log('\nFailed items:');
            results.failedItems.forEach(item => console.log(`  - ${item}`));
        }
        
        console.log('Task finished.');
        
    } catch (error) {
        console.error('Fatal error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
downloadFiles().catch(console.error);
