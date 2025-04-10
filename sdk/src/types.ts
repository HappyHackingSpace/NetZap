/**
 * ZMap scan types
 */
export enum ScanType {
  TCP_SYN = 'tcp_synscan',
  ICMP_ECHO = 'icmp_echoscan',
  UDP = 'udp',
  TCP_SYNACK = 'tcp_synack',
  TCP_ACK = 'tcp_ack',
  TCP_CUSTOM = 'tcp',
  ARP = 'arp',
  IPV6_TCP_SYN = 'ipv6_tcp_syn',
  IPV6_ICMP_ECHO = 'ipv6_icmp_echo',
  UDP_CUSTOM = 'udp'
}

/**
 * Common options for ZMap scans
 */
export interface CommonOptions {
  // Basic arguments
  targetPort?: number;
  outputFile?: string;
  blacklistFile?: string;
  whitelistFile?: string;

  // Scan options
  rate?: number;
  bandwidth?: string;
  maxTargets?: number | string;
  maxRuntime?: number;
  maxResults?: number;
  probes?: number;
  cooldownTime?: number;
  seed?: number;
  retries?: number;
  dryRun?: boolean;
  shardTotal?: number;
  shardCurrent?: number;
  subnet?: string;

  // Network options
  sourcePort?: number | string;
  sourceIp?: string;
  gatewayMac?: string;
  sourceMac?: string;
  interface?: string;
  vpnMode?: boolean;

  // Logging and metadata
  verbosity?: number;
  logFile?: string;
  logDirectory?: string;
  metadataFile?: string;
  statusUpdatesFile?: string;
  quiet?: boolean;
  disableSyslog?: boolean;
  notes?: string;
  userMetadata?: string;

  // Additional options
  configFile?: string;
  maxSendtoFailures?: number;
  minHitrate?: number;
  senderThreads?: number;
  cores?: string;
  ignoreInvalidHosts?: boolean;
}

/**
 * Network options for ZMap scans
 */
export interface NetworkOptions {
  sourcePort?: number | string;
  sourceIp?: string;
  gatewayMac?: string;
  sourceMac?: string;
  interface?: string;
  vpnMode?: boolean;
}

/**
 * Probe options for ZMap scans
 */
export interface ProbeOptions {
  probeModule?: string | ScanType;
  probeArgs?: string;
}

/**
 * Output options for ZMap scans
 */
export interface OutputOptions {
  outputModule?: string;
  outputModuleArgs?: string;
  outputFields?: string | string[];
  outputFilter?: string;
}

/**
 * Logging and Metadata options
 */
export interface LoggingOptions {
  verbosity?: number;
  logFile?: string;
  logDirectory?: string;
  metadataFile?: string;
  statusUpdatesFile?: string;
  quiet?: boolean;
  disableSyslog?: boolean;
  notes?: string;
  userMetadata?: string;
}

/**
 * Additional options for ZMap scans
 */
export interface AdditionalOptions {
  configFile?: string;
  maxSendtoFailures?: number;
  minHitrate?: number;
  senderThreads?: number;
  cores?: string;
  ignoreInvalidHosts?: boolean;
}

/**
 * Complete ZMap scan configuration
 */
export interface ZMapConfig extends CommonOptions, NetworkOptions, ProbeOptions, OutputOptions, LoggingOptions, AdditionalOptions {
  // Custom extensions can be added here
}

/**
 * UDP probe argument types
 */
export type UdpProbeArgType = 'text' | 'hex' | 'file';

/**
 * Result of a ZMap scan
 */
export interface ZMapResult {
  success: boolean;
  output: string;
  exitCode?: number;
  error?: string;
}

/**
 * Template field types for customizing probes
 */
export enum TemplateField {
  SADDR = 'SADDR',
  SADDR_N = 'SADDR_N',
  DADDR = 'DADDR',
  DADDR_N = 'DADDR_N',
  SPORT = 'SPORT',
  SPORT_N = 'SPORT_N',
  DPORT = 'DPORT',
  DPORT_N = 'DPORT_N',
  RAND_BYTE = 'RAND_BYTE',
  RAND_DIGIT = 'RAND_DIGIT',
  RAND_ALPHA = 'RAND_ALPHA',
  RAND_ALPHANUM = 'RAND_ALPHANUM'
}

export interface ZMapModuleInfo {
  name: string;
  description: string;
  fields?: string[];
} 