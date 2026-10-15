import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const range = request.headers.get('range');

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Process Dropbox URL to get direct download link
    let processedUrl = videoUrl;
    if (videoUrl.includes('dropbox.com')) {
      processedUrl = videoUrl
        .replace('?dl=0', '?dl=1')
        .replace('&dl=0', '&dl=1')
        .replace('?raw=0', '?raw=1')
        .replace('&raw=0', '&raw=1');
      
      if (!processedUrl.includes('dl=1') && !processedUrl.includes('raw=1')) {
        const separator = processedUrl.includes('?') ? '&' : '?';
        processedUrl = processedUrl + separator + 'dl=1';
      }
    }

    // Set up headers for the proxy request
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'video/*,*/*;q=0.9',
      'Accept-Encoding': 'identity', // Prevent compression that might interfere with range requests
    };

    // Add range header if present (for video seeking)
    if (range) {
      headers['Range'] = range;
    }

    // Fetch the video from Dropbox
    const response = await fetch(processedUrl, {
      headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error('Failed to fetch video:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: response.status });
    }

    // Get content length from response headers
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type') || 'video/mp4';
    
    console.log('Video response info:', {
      status: response.status,
      contentLength,
      contentType,
      hasRange: !!range
    });

    // Set appropriate headers for video streaming
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');
    responseHeaders.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Handle range requests for video seeking
    if (range && contentLength) {
      const total = parseInt(contentLength, 10);
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      
      // Validate range - be more lenient with validation
      if (isNaN(start) || start < 0 || (parts[1] && (isNaN(end) || end < start))) {
        console.log('Invalid range format:', range);
        // If range is invalid, serve the full video instead of erroring
        responseHeaders.set('Content-Length', contentLength);
        return new NextResponse(response.body, { 
          status: 200, 
          headers: responseHeaders 
        });
      }
      
      // Ensure end doesn't exceed file size
      const actualEnd = Math.min(end, total - 1);
      const chunksize = (actualEnd - start) + 1;
      
      // Only serve range if it's valid and makes sense
      if (chunksize > 0 && start < total) {
        responseHeaders.set('Content-Range', `bytes ${start}-${actualEnd}/${total}`);
        responseHeaders.set('Content-Length', chunksize.toString());
        
        console.log('Serving range request:', { start, end: actualEnd, chunksize, total });
        
        // For range requests, we need to make a new request with the range header
        const rangeResponse = await fetch(processedUrl, {
          headers: {
            ...headers,
            'Range': `bytes=${start}-${actualEnd}`
          },
          redirect: 'follow',
        });
        
        if (rangeResponse.ok) {
          return new NextResponse(rangeResponse.body, { 
            status: 206, 
            headers: responseHeaders 
          });
        }
      }
    }

    // For full video requests, stream the entire response
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    console.log('Serving full video, content-length:', contentLength);

    // Stream the full video
    return new NextResponse(response.body, { 
      status: 200, 
      headers: responseHeaders 
    });

  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Process Dropbox URL to get direct download link
    let processedUrl = videoUrl;
    if (videoUrl.includes('dropbox.com')) {
      processedUrl = videoUrl
        .replace('?dl=0', '?dl=1')
        .replace('&dl=0', '&dl=1')
        .replace('?raw=0', '?raw=1')
        .replace('&raw=0', '&raw=1');
      
      if (!processedUrl.includes('dl=1') && !processedUrl.includes('raw=1')) {
        const separator = processedUrl.includes('?') ? '&' : '?';
        processedUrl = processedUrl + separator + 'dl=1';
      }
    }

    // HEAD request to get metadata
    const response = await fetch(processedUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      redirect: 'follow',
    });

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', response.headers.get('content-type') || 'video/mp4');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');

    if (response.headers.get('content-length')) {
      responseHeaders.set('Content-Length', response.headers.get('content-length')!);
    }

    return new NextResponse(null, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Video HEAD request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}
