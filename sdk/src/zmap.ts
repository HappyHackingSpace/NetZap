// import execa = require('execa');
import {
  ZMapConfig,
  ZMapResult,
  ScanType,
  UdpProbeArgType
} from './types';
import { buildZMapCommand, formatUdpProbeArgs, parseZMapOutput } from './utils';

/**
 * Execute command - will be implemented differently depending on environment
 */
async function executeCommand(command: string, args: string[]): Promise<ZMapResult> {
  // Detect browser environment better
  const isBrowser = typeof window !== 'undefined' && 
                    typeof process === 'undefined' || 
                    (typeof process !== 'undefined' && typeof process.version === 'undefined');
  
  if (isBrowser) {
    console.error('Browser environment detected - command execution not supported');
    return {
      success: false,
      output: '',
      error: 'Command execution is not supported in browser environments. Use the API endpoints instead.',
      exitCode: 1
    };
  }
  
  // Only import execa in Node.js environment
  try {
    // Using require instead of dynamic import for simplicity
    const execa = require('execa');
    
    try {
      // Direct execution on all platforms
      const result = await execa(command, args);
      
      return {
        success: true,
        output: result.stdout,
        exitCode: result.exitCode
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message || 'Unknown error',
        exitCode: error.exitCode || 1
      };
    }
  } catch (err) {
    console.error('Failed to load execa:', err);
    return {
      success: false,
      output: '',
      error: 'Failed to load command execution library',
      exitCode: 1
    };
  }
}

/**
 * Main ZMap SDK Class
 */
export class ZMap {
  private config: ZMapConfig;
  private executablePath: string;

  /**
   * Create a new ZMap instance
   * @param config - Initial configuration
   * @param executablePath - Path to the ZMap executable (defaults to 'zmap' in PATH)
   */
  constructor(config: Partial<ZMapConfig> = {}, executablePath: string = 'zmap') {
    this.config = config as ZMapConfig;
    this.executablePath = executablePath;
  }

  /**
   * Set ZMap configuration
   * @param config - ZMap configuration to set
   * @returns Current ZMap instance
   */
  public setConfig(config: Partial<ZMapConfig>): ZMap {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Get current ZMap configuration
   * @returns Current ZMap configuration
   */
  public getConfig(): ZMapConfig {
    return { ...this.config };
  }

  /**
   * Set the ZMap executable path
   * @param path - Path to the ZMap executable
   * @returns Current ZMap instance
   */
  public setExecutablePath(path: string): ZMap {
    this.executablePath = path;
    return this;
  }

  /**
   * Configure for a TCP SYN scan
   * @param targetPort - Target port to scan
   * @param options - Additional options
   * @returns Current ZMap instance
   */
  public tcpSynScan(targetPort: number, options: Partial<ZMapConfig> = {}): ZMap {
    return this.setConfig({
      probeModule: ScanType.TCP_SYN,
      targetPort,
      ...options
    });
  }

  /**
   * Configure for an ICMP Echo scan
   * @param options - Additional options
   * @returns Current ZMap instance
   */
  public icmpEchoScan(options: Partial<ZMapConfig> = {}): ZMap {
    return this.setConfig({
      probeModule: ScanType.ICMP_ECHO,
      ...options
    });
  }

  /**
   * Configure for a UDP scan
   * @param targetPort - Target port
   * @param probeType - Type of UDP probe (text, hex, file)
   * @param probeValue - Value for the probe
   * @param options - Additional options
   * @returns Current ZMap instance
   */
  public udpScan(
    targetPort: number,
    probeType: UdpProbeArgType,
    probeValue: string,
    options: Partial<ZMapConfig> = {}
  ): ZMap {
    const probeArgs = formatUdpProbeArgs(probeType, probeValue);
    return this.setConfig({
      probeModule: ScanType.UDP,
      targetPort,
      probeArgs,
      ...options
    });
  }

  /**
   * Configure subnet(s) to scan
   * @param subnets - Subnet or array of subnets in CIDR notation
   * @returns Current ZMap instance
   */
  public target(subnets: string | string[]): ZMap {
    return this.setConfig({
      subnet: Array.isArray(subnets) ? subnets.join(' ') : subnets
    });
  }

  /**
   * Set rate limit in packets per second
   * @param pps - Packets per second
   * @returns Current ZMap instance
   */
  public setRate(pps: number): ZMap {
    return this.setConfig({ rate: pps });
  }

  /**
   * Set bandwidth limit
   * @param bps - Bandwidth with optional suffix (G, M, K)
   * @returns Current ZMap instance
   */
  public setBandwidth(bps: string): ZMap {
    return this.setConfig({ bandwidth: bps });
  }

  /**
   * Set source port or port range
   * @param port - Source port number or range (e.g., "40000-50000")
   * @returns Current ZMap instance
   */
  public setSourcePort(port: number | string): ZMap {
    return this.setConfig({ sourcePort: port });
  }

  /**
   * Set source IP address or range
   * @param ip - Source IP address or range
   * @returns Current ZMap instance
   */
  public setSourceIp(ip: string): ZMap {
    return this.setConfig({ sourceIp: ip });
  }

  /**
   * Set network interface to use
   * @param iface - Interface name
   * @returns Current ZMap instance
   */
  public setInterface(iface: string): ZMap {
    return this.setConfig({ interface: iface });
  }

  /**
   * Set the gateway MAC address
   * @param mac - MAC address
   * @returns Current ZMap instance
   */
  public setGatewayMac(mac: string): ZMap {
    return this.setConfig({ gatewayMac: mac });
  }

  /**
   * Set the source MAC address
   * @param mac - MAC address
   * @returns Current ZMap instance
   */
  public setSourceMac(mac: string): ZMap {
    return this.setConfig({ sourceMac: mac });
  }

  /**
   * Configure VPN mode (sends IP packets instead of Ethernet)
   * @param enabled - Whether to enable VPN mode
   * @returns Current ZMap instance
   */
  public setVpnMode(enabled: boolean = true): ZMap {
    return this.setConfig({ vpnMode: enabled });
  }

  /**
   * Set output file
   * @param filename - Path to output file
   * @returns Current ZMap instance
   */
  public setOutputFile(filename: string): ZMap {
    return this.setConfig({ outputFile: filename });
  }

  /**
   * Set blacklist file
   * @param filename - Path to blacklist file with CIDR notation
   * @returns Current ZMap instance
   */
  public setBlacklistFile(filename: string): ZMap {
    return this.setConfig({ blacklistFile: filename });
  }

  /**
   * Set whitelist file
   * @param filename - Path to whitelist file with CIDR notation
   * @returns Current ZMap instance
   */
  public setWhitelistFile(filename: string): ZMap {
    return this.setConfig({ whitelistFile: filename });
  }

  /**
   * Set maximum number of targets to probe
   * @param max - Maximum number or percentage of address space
   * @returns Current ZMap instance
   */
  public setMaxTargets(max: number | string): ZMap {
    return this.setConfig({ maxTargets: max });
  }

  /**
   * Set maximum number of results to return
   * @param max - Maximum number of results
   * @returns Current ZMap instance
   */
  public setMaxResults(max: number): ZMap {
    return this.setConfig({ maxResults: max });
  }

  /**
   * Set maximum runtime in seconds
   * @param seconds - Maximum runtime
   * @returns Current ZMap instance
   */
  public setMaxRuntime(seconds: number): ZMap {
    return this.setConfig({ maxRuntime: seconds });
  }

  /**
   * Set the number of probes to send to each IP
   * @param count - Number of probes
   * @returns Current ZMap instance
   */
  public setProbes(count: number): ZMap {
    return this.setConfig({ probes: count });
  }

  /**
   * Set cooldown time in seconds
   * @param seconds - Cooldown time
   * @returns Current ZMap instance
   */
  public setCooldownTime(seconds: number): ZMap {
    return this.setConfig({ cooldownTime: seconds });
  }

  /**
   * Set seed for address permutation
   * @param seed - Seed value
   * @returns Current ZMap instance
   */
  public setSeed(seed: number): ZMap {
    return this.setConfig({ seed: seed });
  }

  /**
   * Set maximum number of retries for sending packets
   * @param count - Maximum retries
   * @returns Current ZMap instance
   */
  public setRetries(count: number): ZMap {
    return this.setConfig({ retries: count });
  }

  /**
   * Enable dry run mode (doesn't actually send packets)
   * @param enabled - Whether to enable dry run mode
   * @returns Current ZMap instance
   */
  public setDryRun(enabled: boolean = true): ZMap {
    return this.setConfig({ dryRun: enabled });
  }

  /**
   * Configure sharding
   * @param total - Total number of shards
   * @param current - Current shard (0-indexed)
   * @returns Current ZMap instance
   */
  public setSharding(total: number, current: number = 0): ZMap {
    return this.setConfig({
      shardTotal: total,
      shardCurrent: current
    });
  }

  /**
   * Set output fields
   * @param fields - Output fields as array or comma-separated string
   * @returns Current ZMap instance
   */
  public setOutputFields(fields: string[] | string): ZMap {
    return this.setConfig({ outputFields: fields });
  }

  /**
   * Set output module
   * @param module - Output module name
   * @param args - Arguments to pass to output module
   * @returns Current ZMap instance
   */
  public setOutputModule(module: string, args?: string): ZMap {
    return this.setConfig({
      outputModule: module,
      outputModuleArgs: args
    });
  }

  /**
   * Set output filter
   * @param filter - Filter expression
   * @returns Current ZMap instance
   */
  public setOutputFilter(filter: string): ZMap {
    return this.setConfig({ outputFilter: filter });
  }

  /**
   * Set verbosity level
   * @param level - Verbosity level (0-5)
   * @returns Current ZMap instance
   */
  public setVerbosity(level: number): ZMap {
    return this.setConfig({ verbosity: level });
  }

  /**
   * Set log file
   * @param filename - Path to log file
   * @returns Current ZMap instance
   */
  public setLogFile(filename: string): ZMap {
    return this.setConfig({ logFile: filename });
  }

  /**
   * Set log directory
   * @param directory - Path to log directory
   * @returns Current ZMap instance
   */
  public setLogDirectory(directory: string): ZMap {
    return this.setConfig({ logDirectory: directory });
  }

  /**
   * Set metadata file
   * @param filename - Path to metadata file
   * @returns Current ZMap instance
   */
  public setMetadataFile(filename: string): ZMap {
    return this.setConfig({ metadataFile: filename });
  }

  /**
   * Set status updates file
   * @param filename - Path to status updates file
   * @returns Current ZMap instance
   */
  public setStatusUpdatesFile(filename: string): ZMap {
    return this.setConfig({ statusUpdatesFile: filename });
  }

  /**
   * Enable quiet mode (do not print status updates)
   * @param enabled - Whether to enable quiet mode
   * @returns Current ZMap instance
   */
  public setQuiet(enabled: boolean = true): ZMap {
    return this.setConfig({ quiet: enabled });
  }

  /**
   * Disable syslog
   * @param disabled - Whether to disable syslog
   * @returns Current ZMap instance
   */
  public disableSyslog(disabled: boolean = true): ZMap {
    return this.setConfig({ disableSyslog: disabled });
  }

  /**
   * Set notes to inject into scan metadata
   * @param notes - Notes to inject
   * @returns Current ZMap instance
   */
  public setNotes(notes: string): ZMap {
    return this.setConfig({ notes: notes });
  }

  /**
   * Set user metadata to inject into scan metadata
   * @param metadata - User metadata to inject (as object or JSON string)
   * @returns Current ZMap instance
   */
  public setUserMetadata(metadata: object | string): ZMap {
    if (typeof metadata === 'object') {
      metadata = JSON.stringify(metadata);
    }
    return this.setConfig({ userMetadata: metadata });
  }

  /**
   * Set configuration file
   * @param filename - Path to configuration file
   * @returns Current ZMap instance
   */
  public setConfigFile(filename: string): ZMap {
    return this.setConfig({ configFile: filename });
  }

  /**
   * Set maximum NIC sendto failures before aborting
   * @param max - Maximum failures
   * @returns Current ZMap instance
   */
  public setMaxSendtoFailures(max: number): ZMap {
    return this.setConfig({ maxSendtoFailures: max });
  }

  /**
   * Set minimum hitrate before aborting
   * @param rate - Minimum hitrate
   * @returns Current ZMap instance
   */
  public setMinHitrate(rate: number): ZMap {
    return this.setConfig({ minHitrate: rate });
  }

  /**
   * Set number of sender threads
   * @param count - Thread count
   * @returns Current ZMap instance
   */
  public setSenderThreads(count: number): ZMap {
    return this.setConfig({ senderThreads: count });
  }

  /**
   * Set cores to pin to
   * @param cores - Comma-separated list of cores
   * @returns Current ZMap instance
   */
  public setCores(cores: string): ZMap {
    return this.setConfig({ cores: cores });
  }

  /**
   * Enable ignoring invalid hosts in whitelist/blacklist
   * @param enabled - Whether to ignore invalid hosts
   * @returns Current ZMap instance
   */
  public ignoreInvalidHosts(enabled: boolean = true): ZMap {
    return this.setConfig({ ignoreInvalidHosts: enabled });
  }

  /**
   * Execute ZMap with current configuration
   * @returns ZMap execution result
   */
  public async execute(): Promise<ZMapResult> {
    const args = buildZMapCommand(this.config);
    return executeCommand(this.executablePath, args);
  }

  /**
   * Execute the scan and parse the results
   * @returns Promise that resolves to parsed results
   */
  public async executeAndParse(): Promise<Record<string, string>[]> {
    const result = await this.execute();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to execute ZMap scan');
    }
    
    return parseZMapOutput(result.output);
  }

  /**
   * List available probe modules
   * @returns Promise that resolves to array of probe modules
   */
  public async listProbeModules(): Promise<string[]> {
    const result = await executeCommand(this.executablePath, ['--list-probe-modules']);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to list probe modules');
    }
    
    return result.output
      .trim()
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.trim());
  }

  /**
   * List available output modules
   * @returns Promise that resolves to array of output modules
   */
  public async listOutputModules(): Promise<string[]> {
    const result = await executeCommand(this.executablePath, ['--list-output-modules']);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to list output modules');
    }
    
    return result.output
      .trim()
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.trim());
  }

  /**
   * List available output fields for the current probe module
   * @returns Promise that resolves to array of field names
   */
  public async listOutputFields(): Promise<string[]> {
    const result = await executeCommand(this.executablePath, ['--list-output-fields']);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to list output fields');
    }
    
    return result.output
      .trim()
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const match = line.match(/^\s*(\S+)/);
        return match ? match[1] : line.trim();
      });
  }

  /**
   * Get ZMap help information
   * @returns Promise that resolves to help text
   */
  public async help(): Promise<string> {
    const result = await executeCommand(this.executablePath, ['--help']);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get help');
    }
    
    return result.output;
  }

  /**
   * Get ZMap version information
   * @returns Promise that resolves to version text
   */
  public async version(): Promise<string> {
    const result = await executeCommand(this.executablePath, ['--version']);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get version');
    }
    
    return result.output.trim();
  }

  /**
   * Get help for a specific probe module
   * @param module - Probe module name (optional, uses current config if not provided)
   * @returns Promise that resolves to help text
   */
  public async probeModuleHelp(module?: string): Promise<string> {
    const args = module 
      ? ['--probe-module', module, '--help']
      : ['--help-probe-modules'];
    
    const result = await executeCommand(this.executablePath, args);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get probe module help');
    }
    
    return result.output;
  }

  /**
   * Get help for a specific output module
   * @param module - Output module name (optional, uses current config if not provided)
   * @returns Promise that resolves to help text
   */
  public async outputModuleHelp(module?: string): Promise<string> {
    const args = module 
      ? ['--output-module', module, '--help']
      : ['--help-output-modules'];
    
    const result = await executeCommand(this.executablePath, args);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get output module help');
    }
    
    return result.output;
  }

  /* Add other methods as needed */
} 