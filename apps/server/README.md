# @sigle/server

## Setup IPFS Storage (S3-compatible)

Sigle uses an S3-compatible API to pin files to IPFS. Supported providers include [Filebase](https://filebase.com/) and others.

### Filebase Setup

1. Create an account on [Filebase](https://filebase.com/).
2. Create a bucket for Sigle uploads.
3. Generate API access keys from the Filebase dashboard.

### Environment Variables

Set the following environment variables:

```env
S3_ENDPOINT="https://s3.filebase.com"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="your-bucket-name"
S3_IPFS_GATEWAY_URL="https://ipfs.filebase.io/ipfs"
```

For other S3-compatible IPFS providers, replace the endpoint and gateway URL accordingly.
