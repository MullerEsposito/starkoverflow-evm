/**
 * Filecoin Storage utilities using Lighthouse SDK
 * Provides perpetual storage on Filecoin network
 */

import lighthouse from '@lighthouse-web3/sdk'

const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY

/**
 * Upload text content to Filecoin via Lighthouse
 * @param content - Text content to upload
 * @param filename - Optional filename (defaults to timestamp)
 * @returns IPFS CID stored on Filecoin
 */
export async function uploadText(content: string, filename?: string): Promise<string> {
    try {
        if (!LIGHTHOUSE_API_KEY) {
            throw new Error('Lighthouse API key not configured. Please set VITE_LIGHTHOUSE_API_KEY in .env')
        }

        // Create a File object from the text content
        const blob = new Blob([content], { type: 'text/plain' })
        const file = new File([blob], filename || `content-${Date.now()}.txt`, { type: 'text/plain' })

        // Upload to Lighthouse (Filecoin)
        const output = await lighthouse.upload([file], LIGHTHOUSE_API_KEY)

        const cid = output.data.Hash
        console.log('Text uploaded to Filecoin via Lighthouse:', {
            cid,
            name: output.data.Name,
            size: output.data.Size
        })

        return cid
    } catch (error) {
        console.error('Error uploading text to Filecoin:', error)
        throw new Error(`Failed to upload text to Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Upload image file to Filecoin via Lighthouse
 * @param file - Image file to upload
 * @returns IPFS CID stored on Filecoin
 */
export async function uploadImage(file: File): Promise<string> {
    try {
        if (!LIGHTHOUSE_API_KEY) {
            throw new Error('Lighthouse API key not configured. Please set VITE_LIGHTHOUSE_API_KEY in .env')
        }

        // Upload to Lighthouse (Filecoin)
        const output = await lighthouse.upload([file], LIGHTHOUSE_API_KEY)

        const cid = output.data.Hash
        console.log('Image uploaded to Filecoin via Lighthouse:', {
            cid,
            name: output.data.Name,
            size: output.data.Size
        })

        return cid
    } catch (error) {
        console.error('Error uploading image to Filecoin:', error)
        throw new Error(`Failed to upload image to Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Upload any file to Filecoin via Lighthouse
 * @param file - File to upload
 * @returns IPFS CID stored on Filecoin
 */
export async function uploadFile(file: File): Promise<string> {
    try {
        if (!LIGHTHOUSE_API_KEY) {
            throw new Error('Lighthouse API key not configured. Please set VITE_LIGHTHOUSE_API_KEY in .env')
        }

        const output = await lighthouse.upload([file], LIGHTHOUSE_API_KEY)

        const cid = output.data.Hash
        console.log('File uploaded to Filecoin via Lighthouse:', {
            cid,
            name: output.data.Name,
            size: output.data.Size
        })

        return cid
    } catch (error) {
        console.error('Error uploading file to Filecoin:', error)
        throw new Error(`Failed to upload file to Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Get upload status from Filecoin
 * @param cid - IPFS CID to check
 * @returns Upload status information
 */
export async function getFilecoinStatus(cid: string) {
    try {
        if (!LIGHTHOUSE_API_KEY) {
            throw new Error('Lighthouse API key not configured')
        }

        const status = await lighthouse.getUploads(LIGHTHOUSE_API_KEY)
        const upload = status.data.fileList.find((file: any) => file.cid === cid)

        return {
            found: !!upload,
            fileName: upload?.fileName,
            mimeType: upload?.mimeType,
            fileSize: upload?.fileSize,
            uploadedAt: upload?.createdAt
        }
    } catch (error) {
        console.error('Error getting Filecoin status:', error)
        return { found: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Check if Lighthouse is configured
 */
export function isLighthouseConfigured(): boolean {
    return !!LIGHTHOUSE_API_KEY
}

/**
 * Get total storage used on Filecoin
 * @returns Total storage statistics
 */
export async function getStorageStats() {
    try {
        if (!LIGHTHOUSE_API_KEY) {
            throw new Error('Lighthouse API key not configured')
        }

        const uploads = await lighthouse.getUploads(LIGHTHOUSE_API_KEY)

        const totalSize = uploads.data.fileList.reduce((acc: number, file: any) => {
            return acc + parseInt(file.fileSize || '0')
        }, 0)

        return {
            totalFiles: uploads.data.fileList.length,
            totalSize,
            uploads: uploads.data.fileList
        }
    } catch (error) {
        console.error('Error getting storage stats:', error)
        return {
            totalFiles: 0,
            totalSize: 0,
            uploads: []
        }
    }
}
