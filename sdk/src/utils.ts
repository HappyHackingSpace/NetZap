import { ZMapConfig, UdpProbeArgType } from './types';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Converts camelCase to kebab-case
 * @param input - The camelCase string
 * @returns The kebab-case string
 */
export function camelToKebab(input: string): string {
  return input.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

const specialCaseMapping: Record<string, string> = {
  probeModule: '--probe-module',
  targetPort: '--target-port',
  sourcePort: '--source-port',
  sourceIp: '--source-ip',
  gatewayMac: '--gateway-mac',
  sourceMac: '--source-mac',
  interfaceName: '--interface',
  maxTargets: '--max-targets',
  maxResults: '--max-results',
  maxRuntime: '--max-runtime',
  cooldownTime: '--cooldown-time',
  probeArgs: '--probe-args',
  outputFile: '--output-file',
  blacklistFile: '--blacklist-file',
  whitelistFile: '--whitelist-file',
  outputFields: '--output-fields',
  outputModule: '--output-module',
  outputModuleArgs: '--output-module-args',
  outputFilter: '--output-filter',
  logFile: '--log-file',
  logDirectory: '--log-directory',
  metadataFile: '--metadata-file',
  statusUpdatesFile: '--status-updates-file',
  disableSyslog: '--disable-syslog',
  userMetadata: '--user-metadata',
  configFile: '--config',
  maxSendtoFailures: '--max-sendto-failures',
  minHitrate: '--min-hitrate',
  senderThreads: '--sender-threads'
};

/**
 * Builds a ZMap command string from a configuration object
 * @param config - ZMap configuration
 * @returns Formatted command string
 */
export function buildZMapCommand(config: ZMapConfig): string[] {
  const args: string[] = [];
  
  const subnet = config.subnet;
  
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    if (key === 'subnet') {
      continue;
    }
    
    if (key === 'outputFields') {
      if (Array.isArray(value)) {
        args.push('--output-fields');
        args.push(value.join(','));
      } else if (typeof value === 'string') {
        args.push('--output-fields');
        args.push(value);
      }
      continue;
    }
    
    if (key === 'userMetadata' && typeof value === 'object') {
      args.push('--user-metadata');
      args.push(JSON.stringify(value));
      continue;
    }
    
    const flag = specialCaseMapping[key] || `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
    
    if (typeof value === 'boolean') {
      if (value) {
        args.push(flag);
      }
    } else {
      args.push(flag);
      args.push(value.toString());
    }
  }
  
  if (subnet) {
    args.push(subnet);
  }
  
  return args;
}

/**
 * Formats UDP probe arguments
 * @param type - The type of probe argument (text, hex, file)
 * @param value - The value to use
 * @returns Formatted probe argument string
 */
export function formatUdpProbeArgs(type: UdpProbeArgType, value: string): string {
  switch (type) {
    case 'text':
      return `text "${value}"`;
    case 'hex':
      return `hex ${value}`;
    case 'file':
      return `file ${value}`;
    default:
      return value;
  }
}

/**
 * Parse ZMap output into structured data
 * @param output - Raw output from ZMap
 * @returns Structured data
 */
export function parseZMapOutput(output: string): Record<string, string>[] {
  if (!output || !output.trim()) {
    return [];
  }
  
  const lines = output.trim().split('\n');
  const results: Record<string, string>[] = [];
  
  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) {
      continue;
    }
    
    const values = line.split(',');
    
    if (values.length < 2) {
      continue;
    }
    
    const row: Record<string, string> = {};
    
    row.saddr = values[0].trim();
    row.classification = values[1].trim();
    
    if (values.length >= 3) {
      row.dport = values[2].trim();
    }
    
    results.push(row);
  }
  
  return results;
} 