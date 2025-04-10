import { NextResponse } from 'next/server';
import { ZMap } from '../../../sdk/src';
import { parseZMapOutput } from '../../../sdk/src/utils';
import { createScan, saveScanResults, updateScanStatus } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execPromise = promisify(exec);

function parseRawIpList(output: string, port: number = 80): Record<string, string>[] {
  if (!output.trim()) return [];
  
  const ips = output.trim().split('\n').filter(ip => ip.trim());
  
  return ips.map(ip => ({
    saddr: ip.trim(),
    dport: port.toString(),
    classification: 'synack'
  }));
}

async function checkZMapInstalled(): Promise<boolean> {
  try {
    await execPromise('zmap -h', { timeout: 2000 });
    return true;
  } catch (error) {
    console.error('ZMap not found:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const isZMapInstalled = await checkZMapInstalled();
    
    if (!isZMapInstalled) {
      return NextResponse.json(
        { 
          error: 'ZMap is not installed or not found in PATH. Please install ZMap on your system. Visit https://github.com/zmap/zmap for installation instructions.' 
        },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    
    const { subnet, port = 80, scanType = 'tcp_synscan', options = {} } = body;
    
    if (!subnet) {
      return NextResponse.json(
        { error: 'Target subnet is required' },
        { status: 400 }
      );
    }
    
    const zmap = new ZMap();
    let command = '';
    
    switch(scanType) {
      case 'tcp_synscan':
        zmap.setConfig({
          probeModule: 'tcp_synscan',
          targetPort: port,
          subnet,
          ...options
        });
        break;
      case 'icmp_echo':
        zmap.setConfig({
          probeModule: 'icmp_echoscan',
          subnet,
          ...options
        });
        break;
      case 'udp':
        if (!options.probeArgs) {
          options.probeArgs = 'text "\\0"';
        }
        zmap.setConfig({
          probeModule: 'udp',
          targetPort: port,
          subnet,
          ...options
        });
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported scan type: ${scanType}` },
          { status: 400 }
        );
    }
    
    const config = zmap.getConfig();
    command = JSON.stringify(config, null, 2);
    console.log('Executing scan with command:', command);
    
    const scan = await createScan({
      target: subnet,
      port: port,
      scanType: scanType,
      command: command,
      hostsScanned: 0,
      hostsUp: 0,
      endTime: null
    });
    
    try {
      const result = await zmap.execute();
      
      if (!result.success) {
        await updateScanStatus(scan.id, 'failed', {
          error: result.error || 'Scan failed'
        });
        
        return NextResponse.json(
          { error: result.error || 'Scan failed', exitCode: result.exitCode },
          { status: 500 }
        );
      }
      
      let parsedResults = parseZMapOutput(result.output);
      
      if (parsedResults.length === 0 && result.output.trim()) {
        parsedResults = parseRawIpList(result.output, port);
      }
      
      const dbResults = parsedResults.map(result => ({
        ip: result.saddr,
        port: parseInt(result.dport) || port,
        protocol: scanType === 'icmp_echo' ? 'icmp' : 'tcp',
        status: result.classification === 'synack' ? 'open' : 'closed',
        scanId: scan.id
      }));
      
      await saveScanResults(dbResults);
      
      await updateScanStatus(scan.id, 'completed', {
        hostsScanned: parseInt(subnet.split('/')[1]) ? Math.pow(2, 32 - parseInt(subnet.split('/')[1])) : 1,
        hostsUp: dbResults.length
      });
      
      return NextResponse.json({
        success: true,
        scanId: scan.id,
        results: parsedResults,
        count: parsedResults.length,
        rawOutput: result.output
      });
    } catch (error: any) {
      await updateScanStatus(scan.id, 'failed', {
        error: error.message || 'Unknown error during scan execution'
      });
      
      return NextResponse.json(
        { error: error.message || 'Unknown error during scan execution' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}

