module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Disable storage reset to speed up testing
    disableStorageReset: true,
    // Throttle settings for realistic 4G
    throttling: {
      rttMs: 150,
      throughputKbps: 1.6 * 1024,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1.6 * 1024,
      uploadThroughputKbps: 750,
    },
    // Skip certain audits
    skipAudits: [],
  },
  audits: [
    // Performance audits
    'first-contentful-paint',
    'largest-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    'speed-index',
  ],
}
