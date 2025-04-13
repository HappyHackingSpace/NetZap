/**
 * Browser-compatible version of the NetZap SDK
 * 
 * This entry point provides a browser-safe implementation
 * that uses mock functions instead of Node.js modules.
 */

// Export a browser-compatible executeCommand function to override the one in zmap.ts
export async function executeCommand(command: string, args: string[]): Promise<any> {
  console.log('Browser environment detected - command execution not supported');
  return {
    success: false,
    output: '',
    error: 'Command execution is not supported in browser environments. Use the API endpoints instead.',
    exitCode: 1
  };
}

// Import ZMap class for extending it
import { ZMap as NodeZMap } from './zmap';
import {
  ScanType,
  UdpProbeArgType,
  TemplateField,
  ZMapConfig,
  ZMapResult,
  CommonOptions,
  NetworkOptions,
  ProbeOptions,
  OutputOptions,
  LoggingOptions,
  AdditionalOptions
} from './types';
import { buildZMapCommand, formatUdpProbeArgs, parseZMapOutput } from './utils';

/**
 * Browser-compatible ZMap class
 * This extends the Node.js ZMap class but overrides methods that aren't compatible with browsers
 */
export class ZMap extends NodeZMap {
  /**
   * Execute method that works in browsers by providing mock API response
   * In a real application, this would call a backend API instead
   */
  public async execute(): Promise<ZMapResult> {
    console.log('Browser execute called - returning mock response');
    const config = this.getConfig();
    return {
      success: false,
      output: '',
      error: 'ZMap execution is not supported in browsers. Use a backend API instead.',
      exitCode: 1
    };
  }

  /**
   * Browser-compatible version of output field listing
   */
  public async listOutputFields(): Promise<string[]> {
    console.log('Browser listOutputFields called - returning mock fields');
    return ['saddr', 'daddr', 'sport', 'dport', 'seqnum', 'acknum', 'window'];
  }

  /**
   * Browser-compatible version of probe module listing
   */
  public async listProbeModules(): Promise<string[]> {
    console.log('Browser listProbeModules called - returning mock modules');
    return ['tcp_synscan', 'udp', 'icmp_echoscan'];
  }

  /**
   * Browser-compatible version of output module listing
   */
  public async listOutputModules(): Promise<string[]> {
    console.log('Browser listOutputModules called - returning mock modules');
    return ['csv', 'json', 'text'];
  }

  /**
   * Browser-compatible version of version check
   */
  public async version(): Promise<string> {
    return "zmap browser mock (no version)";
  }

  /**
   * Browser-compatible version of help
   */
  public async help(): Promise<string> {
    return "ZMap is not available in browser environments. Please use the API or command line.";
  }
}

// Re-export enums (values)
export { ScanType, UdpProbeArgType, TemplateField } from './types';

// Re-export interface types using export type
export type { 
  ZMapConfig, 
  ZMapResult,
  CommonOptions,
  NetworkOptions, 
  ProbeOptions,
  OutputOptions,
  LoggingOptions,
  AdditionalOptions
} from './types';

// Re-export utility functions
export {
  buildZMapCommand,
  formatUdpProbeArgs,
  parseZMapOutput
} from './utils'; 