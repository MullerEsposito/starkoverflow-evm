/**
 * Converts an IPFS CID to a full gateway URL
 * Uses Filecoin gateway by default
 */

const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/"

/**
 * Converts an IPFS CID to a full URL using the configured gateway
 * @param cid - The IPFS Content Identifier
 * @returns Full IPFS gateway URL, or empty string if CID is invalid
 */
export const cidToUrl = (cid: string): string => {
    if (!cid || cid.trim() === "") {
        return ""
    }

    // If it's already a full URL, return as-is
    if (cid.startsWith("http://") || cid.startsWith("https://")) {
        return cid
    }

    // Remove ipfs:// prefix if present
    const cleanCid = cid.replace(/^ipfs:\/\//, "")

    return `${IPFS_GATEWAY}${cleanCid}`
}

/**
 * Converts a URL back to CID (for uploading to contract)
 * @param url - The IPFS gateway URL
 * @returns Just the CID portion
 */
export const urlToCid = (url: string): string => {
    if (!url || url.trim() === "") {
        return ""
    }

    // If it's already just a CID, return as-is
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return url.replace(/^ipfs:\/\//, "")
    }

    // Extract CID from various gateway formats
    const ipfsMatch = url.match(/\/ipfs\/([^/?#]+)/)
    if (ipfsMatch) {
        return ipfsMatch[1]
    }

    // If no match, return the original (might be a CID already)
    return url
}
