# NetZap SDK

A TypeScript SDK for working with the ZMap network scanner.

## Installation

```bash
npm install netzap-sdk
```

## Usage

```typescript
import { ZMap, ScanType } from 'netzap-sdk';

// Create a new ZMap instance
const zmap = new ZMap();

// Configure a TCP SYN scan
zmap.tcpSynScan(80, {
  subnet: '192.168.1.0/24',
  rate: 1000,
  outputFile: 'results.csv'
});

// Execute the scan
const result = await zmap.execute();
console.log(result);

// Or execute and parse the results
const parsedResults = await zmap.executeAndParse();
console.log(parsedResults);
```

## Real Network Scanning

The SDK now always performs real network scanning with ZMap. Make sure you have ZMap installed on your system and appropriate permissions to run scans.

```typescript
// Example of a real network scan
const zmap = new ZMap();

// Configure scan with appropriate settings for your network
const result = await zmap
  .tcpSynScan(80)
  .target('192.168.1.0/24') // Set to your actual target network
  .setRate(100) // Use a low rate to avoid disruption
  .setBandwidth('1M') // Limit bandwidth usage
  .setInterface('eth0') // Set to your network interface
  .setBlacklistFile('/etc/zmap/blacklist.conf') // Respect blacklist
  .execute();

if (result.success) {
  console.log('Scan successful!');
  console.log(result.output);
}
```

### Important Notes for Real Scanning

1. **Permissions**: ZMap typically requires root/admin privileges to run
2. **Legal Considerations**: Only scan networks you have permission to scan
3. **Rate Limiting**: Start with low rates (100-500 pps) to avoid network disruption
4. **Blacklists**: Use appropriate blacklist files to avoid scanning sensitive targets
5. **Interface**: Specify the correct network interface for your system

## API Reference

### Creating a ZMap Instance

```typescript
// Basic initialization
const zmap = new ZMap();

// With initial configuration
const zmap = new ZMap({
  targetPort: 80,
  outputFile: 'results.csv'
});

// With custom path to ZMap executable
const zmap = new ZMap({}, '/usr/sbin/zmap');
```

### Scan Types

The SDK supports the following scan types:

```typescript
// TCP SYN scan
zmap.tcpSynScan(80);

// ICMP Echo scan
zmap.icmpEchoScan();

// UDP scan
zmap.udpScan(53, UdpProbeArgType.TEXT, 'GET / HTTP/1.0\r\n\r\n');
```

### Configuration Methods

The SDK provides fluent configuration methods:

```typescript
zmap
  .setRate(1000)
  .setBandwidth('10M')
  .setSourcePort(12345)
  .setInterface('eth0')
  .target('192.168.1.0/24');
```

### Executing Scans

```typescript
// Execute a scan
const result = await zmap.execute();

// Execute and parse results
const parsedResults = await zmap.executeAndParse();
```

### Utility Methods

```typescript
// Get information about ZMap
const probeModules = await zmap.listProbeModules();
const outputModules = await zmap.listOutputModules();
const fields = await zmap.listOutputFields();
const help = await zmap.help();
const version = await zmap.version();
```

## Integration with React Applications

To use the SDK in React applications, you can create a context provider:

```typescript
import { createContext, useContext, useState } from 'react';
import { ZMap, ZMapConfig } from 'netzap-sdk';

const NetZapContext = createContext({ sdk: null, ...otherValues });

export function NetZapProvider({ children }) {
  const [sdk] = useState(() => new ZMap());
  
  // Add your state and methods here
  
  return (
    <NetZapContext.Provider value={{ sdk, ...otherValues }}>
      {children}
    </NetZapContext.Provider>
  );
}

export function useNetZap() {
  return useContext(NetZapContext);
}
```

## License

MIT 