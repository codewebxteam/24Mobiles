import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { file, fileName } = await req.json();

        if (!file || !fileName) {
            return NextResponse.json({ error: 'File and fileName are required' }, { status: 400 });
        }

        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (!privateKey) {
            console.error("ImageKit Private Key is missing");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const authString = Buffer.from(privateKey + ':').toString('base64');
        const formData = new FormData();
        formData.append('file', file); // can be base64 string
        formData.append('fileName', fileName);
        formData.append('folder', '/products');
        formData.append('useUniqueFileName', 'true');

        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("ImageKit error:", data);
            return NextResponse.json({ error: data.message || 'Upload failed' }, { status: response.status });
        }

        return NextResponse.json({ url: data.url, fileId: data.fileId }, { status: 200 });
    } catch (error) {
        console.error("Upload route error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
