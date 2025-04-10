import { ZMap, ScanType } from '../src';
import { parseZMapOutput } from '../src/utils';

/**
 * Basic example of using the NetZap SDK to run a TCP SYN scan
 */
async function runTcpSynScan() {
  try {
    // Create a new ZMap instance
    const zmap = new ZMap();
    
    // Configure a TCP SYN scan on port 80 with options
    zmap.tcpSynScan(80, {
      subnet: '192.168.1.0/24',  // Target subnet
      rate: 1000,                // 1000 packets per second
      outputFile: 'results.csv', // Output file
      maxTargets: 500,           // Scan at most 500 targets
      cooldownTime: 5            // Wait 5 seconds after completion
    });
    
    console.log('Executing scan with command:');
    console.log(zmap.getConfig());
    
    // Execute the scan and get results
    const result = await zmap.execute();
    
    if (result.success) {
      console.log('Scan completed successfully');
      console.log('Exit code:', result.exitCode);
      console.log('Output:', result.output);
    } else {
      console.error('Scan failed:', result.error);
    }
    
    // Parse CSV results
    try {
      const parsedResults = await zmap.executeAndParse();
      console.log('Parsed results:');
      console.table(parsedResults);
    } catch (parseError) {
      console.error('Error parsing results:', parseError);
    }
  } catch (error) {
    console.error('Error executing scan:', error);
  }
}

/**
 * Example of an ICMP Echo (ping) scan
 */
async function runIcmpScan() {
  try {
    // Create a new ZMap instance
    const zmap = new ZMap();
    
    // Configure an ICMP Echo scan
    zmap.icmpEchoScan({
      subnet: '192.168.1.0/24',
      rate: 500,
      outputFile: 'ping_results.csv'
    });
    
    console.log('Executing ICMP scan...');
    
    // Execute the scan
    const result = await zmap.execute();
    
    if (result.success) {
      console.log('ICMP scan completed successfully');
      console.log('Output preview:', result.output.substring(0, 500));
    } else {
      console.error('ICMP scan failed:', result.error);
    }
  } catch (error) {
    console.error('Error executing ICMP scan:', error);
  }
}

/**
 * Example of a method-chaining approach
 */
async function chainedConfigExample() {
  try {
    const zmap = new ZMap();
    
    const result = await zmap
      .tcpSynScan(443)
      .target('192.168.1.0/24')
      .setRate(1000)
      .setBandwidth('5M')
      .setSourcePort(40000)
      .setInterface('eth0')
      .setOutputFile('https_scan.csv')
      .setOutputFields(['saddr', 'daddr', 'sport', 'dport', 'classification'])
      .execute();
    
    console.log('Chained scan result:', result.success ? 'Success' : 'Failed');
  } catch (error) {
    console.error('Error in chained configuration example:', error);
  }
}

/**
 * Example of a real ZMap scan (no simulation)
 * 
 * This performs an actual network scan using zmap with specified bandwidth and target.
 * Make sure you have the proper permissions and are scanning allowed targets.
 */
async function runRealScan() {
  try {
    // Create a new ZMap instance
    // You can specify the path to zmap executable if it's not in PATH
    const zmap = new ZMap({}, 'zmap');
    
    // Configure a TCP SYN scan on port 80 with careful options for real scanning
    const result = await zmap
      .tcpSynScan(80)
      .target('192.168.1.0/24') // Set this to your target
      .setRate(100) // Slow rate to avoid network disruption
      .setBandwidth('1M') // Limited bandwidth
      .setInterface('eth0') // Set to your network interface
      .setMaxTargets(100) // Limit number of targets
      .setBlacklistFile('/etc/zmap/blacklist.conf') // Respect blacklist
      .setLogFile('zmap.log') // Log to file
      .setOutputFile('real_results.csv') // Save results
      .setOutputFields(['saddr', 'classification'])
      .execute();
    
    if (result.success) {
      console.log('Real scan completed successfully');
      console.log('Exit code:', result.exitCode);
      console.log('Output:', result.output);
      
      // Parse the results
      const parsedResults = parseZMapOutput(result.output);
      console.log('Parsed results:');
      console.table(parsedResults);
    } else {
      console.error('Real scan failed:', result.error);
    }
  } catch (error) {
    console.error('Error in real scan:', error);
  }
}

// Uncomment one of these to run the example
// runTcpSynScan();
// runIcmpScan();
// chainedConfigExample();
runRealScan(); // Run the real scan example by default

console.log('NetZap SDK examples with real ZMap scanning.'); 