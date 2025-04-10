// Comprehensive example of NetZap ZMap SDK showing all available options
const { ZMap, ScanType, UdpProbeArgType } = require('../dist');

async function main() {
  try {
    // Create a new ZMap instance
    const zmap = new ZMap();
    
    // Display zmap version
    const version = await zmap.version();
    console.log('ZMap Version:', version);
    
    // List available probe modules
    const probeModules = await zmap.listProbeModules();
    console.log('Available Probe Modules:', probeModules);
    
    // List available output modules
    const outputModules = await zmap.listOutputModules();
    console.log('Available Output Modules:', outputModules);
    
    // EXAMPLE 1: Basic TCP SYN Scan
    console.log('\n--- EXAMPLE 1: Basic TCP SYN Scan ---');
    const basicScanCommand = new ZMap()
      .tcpSynScan(80)
      .target('192.168.1.0/24')
      .setMaxTargets(100)
      .setOutputFile('results.csv')
      .getConfig();
    console.log('Command config:', basicScanCommand);
    
    // EXAMPLE 2: Advanced TCP SYN Scan with multiple options
    console.log('\n--- EXAMPLE 2: Advanced TCP SYN Scan ---');
    const advancedScanCommand = new ZMap()
      .tcpSynScan(443)
      .target(['10.0.0.0/8', '192.168.0.0/16'])
      .setRate(10000) // 10,000 packets per second
      .setBandwidth('100M') // 100 Mbps
      .setSourcePort('40000-50000')
      .setSourceIp('192.168.1.5')
      .setInterface('eth0')
      .setOutputFile('https-scan.csv')
      .setBlacklistFile('/etc/zmap/blacklist.conf')
      .setWhitelistFile('/etc/zmap/whitelist.conf')
      .setMaxTargets('10%') // Scan 10% of address space
      .setMaxResults(1000)
      .setMaxRuntime(300) // 5 minutes
      .setProbes(3)
      .setCooldownTime(15)
      .setSeed(12345)
      .setRetries(5)
      .setDryRun(true)
      .setSharding(4, 0) // First shard of 4
      .getConfig();
    console.log('Command config:', advancedScanCommand);
    
    // EXAMPLE 3: ICMP Echo Scan
    console.log('\n--- EXAMPLE 3: ICMP Echo Scan ---');
    const icmpScanCommand = new ZMap()
      .icmpEchoScan()
      .target('8.8.8.8/24')
      .setMaxTargets(100)
      .setOutputFile('ping-results.csv')
      .getConfig();
    console.log('Command config:', icmpScanCommand);
    
    // EXAMPLE 4: UDP Scan with text probe
    console.log('\n--- EXAMPLE 4: UDP Scan with Text Probe ---');
    const udpScanCommand = new ZMap()
      .udpScan(53, UdpProbeArgType.TEXT, 'HELLO')
      .target('8.8.4.4/24')
      .setMaxTargets(100)
      .setOutputFile('udp-scan.csv')
      .getConfig();
    console.log('Command config:', udpScanCommand);
    
    // EXAMPLE 5: Configuring Output Options
    console.log('\n--- EXAMPLE 5: Output Options ---');
    const outputOptionsCommand = new ZMap()
      .tcpSynScan(22)
      .target('172.16.0.0/16')
      .setOutputModule('csv')
      .setOutputFields(['saddr', 'daddr', 'sport', 'dport', 'classification'])
      .setOutputFilter('success = 1 && repeat = 0')
      .getConfig();
    console.log('Command config:', outputOptionsCommand);
    
    // EXAMPLE 6: Logging and Metadata Options
    console.log('\n--- EXAMPLE 6: Logging and Metadata Options ---');
    const loggingCommand = new ZMap()
      .tcpSynScan(3306) // MySQL
      .target('192.168.0.0/16')
      .setVerbosity(4)
      .setLogFile('scan.log')
      .setLogDirectory('/var/log/zmap')
      .setMetadataFile('metadata.json')
      .setStatusUpdatesFile('status.csv')
      .setQuiet(false)
      .disableSyslog(true)
      .setNotes('MySQL scan of internal network')
      .setUserMetadata({ scanId: 12345, purpose: 'security audit' })
      .getConfig();
    console.log('Command config:', loggingCommand);
    
    // EXAMPLE 7: Network Options
    console.log('\n--- EXAMPLE 7: Network Options ---');
    const networkCommand = new ZMap()
      .tcpSynScan(80)
      .target('10.0.0.0/24')
      .setSourcePort(12345)
      .setSourceIp('10.0.0.1')
      .setGatewayMac('00:11:22:33:44:55')
      .setSourceMac('AA:BB:CC:DD:EE:FF')
      .setInterface('eth0')
      .setVpnMode(true)
      .getConfig();
    console.log('Command config:', networkCommand);
    
    // EXAMPLE 8: Additional Options
    console.log('\n--- EXAMPLE 8: Additional Options ---');
    const additionalCommand = new ZMap()
      .tcpSynScan(80)
      .target('192.168.0.0/24')
      .setConfigFile('/etc/zmap/custom.conf')
      .setMaxSendtoFailures(100)
      .setMinHitrate(0.001)
      .setSenderThreads(4)
      .setCores('0,1,2,3')
      .ignoreInvalidHosts(true)
      .getConfig();
    console.log('Command config:', additionalCommand);
    
    // EXAMPLE 9: Custom Probe Module
    console.log('\n--- EXAMPLE 9: Custom Probe Module ---');
    const customProbeCommand = new ZMap()
      .setConfig({
        probeModule: 'tcp_synopt',
        targetPort: 443,
        subnet: '8.8.8.8/24',
        probeArgs: 'mss=1400,tcp_window=65535,tcp_options=MSS|WSCALE|TIMESTAMP|SACK'
      })
      .getConfig()
    console.log('Command config:', customProbeCommand);
    
    // Using the execute method (commented out to prevent actual scanning)
    
    console.log('\nExecuting a real scan:');
    const result = await zmap
      .tcpSynScan(80)
      .target('192.168.1.1/30') // Very limited range
      .setMaxTargets(2)
      .setDryRun(true) // Dry run mode - doesn't actually send packets
      .setVerbosity(4)
      .execute();
    
    console.log('Scan result:', result);
    
    // Parse the results
    if (result.success) {
      const parsedResults = parseZMapOutput(result.output);
      console.log('Parsed results:', parsedResults);
    }
    
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error); 