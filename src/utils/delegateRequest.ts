/**
 * Make a request without awaiting for the response
 */
// http://yurigor.com/how-to-make-http-request-from-node-js-without-waiting-for-response/
import https from 'https';

export const delegateRequest = async (
  host: string,
  path: string,
  data: Record<string, any>
) => {
  const message = JSON.stringify(data);
  const options = {
    hostname: host,
    method: 'POST',
    path: path,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(message),
    },
  };
  await new Promise<void>((resolve, reject) => {
    const req = https.request(options);
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e);
    });
    req.write(message);
    req.end(() => {
      resolve();
    });
  });
};
