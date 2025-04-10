const { ZMap } = require('../dist');

async function main() {
  // Create a new ZMap instance
  const zmap = new ZMap();
  
  try {
    // Check if ZMap is available
    try {
      await zmap.listProbeModules();
    } catch (error) {
      console.error('Error: ZMap is not properly installed or not in your PATH.');
      process.exit(1);
    }
    
    // Run TCP SYN scan on the specified subnet
    const tcpResult = await zmap
      .tcpSynScan(80, {
        // Target the specific subnet
        subnet: '192.168.1.0/24',
        // Show only scan results, no additional output
        quiet: true,
        // Output only IP addresses
        outputFields: ['saddr'],
        // No summary at the end
        summary: false
      })
      .execute();
    
    if (tcpResult.success) {
      // Just print the raw output (IPs)
      console.log(tcpResult.output);
    } else {
      console.error('Scan failed:', tcpResult.error);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the test
main().catch(console.error); 
