// Vercel's serverless runtime has no persistent, shared filesystem: a file
// written during one function invocation is not guaranteed to be visible to
// a later invocation (upload vs. final RFQ submit), and nothing written to
// disk survives past the request lifecycle across deployments. Until real
// object storage (e.g. S3-compatible) is wired in, RFQ file uploads are
// disabled whenever running on Vercel. Locally / on a host with a real
// persistent disk, uploads work as implemented.
export const UPLOADS_ENABLED = !process.env.VERCEL;
