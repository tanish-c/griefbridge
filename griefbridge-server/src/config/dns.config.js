/**
 * DNS Resolution Utility for MongoDB Atlas
 * Provides fallback DNS servers when primary ISP DNS fails
 */

import dns from 'dns';
import { Resolver } from 'dns/promises';

const PUBLIC_DNS_SERVERS = [
  '8.8.8.8',        // Google DNS
  '1.1.1.1',        // Cloudflare DNS
  '208.67.222.222', // OpenDNS
];

export function setupDNS() {
  // Create a custom resolver for the primary DNS
  const primaryResolver = new dns.Resolver();
  
  // Try to use a public DNS server
  primaryResolver.setServers([PUBLIC_DNS_SERVERS[0]]);
  
  // Also set system-wide default servers to include public DNS
  const servers = dns.getServers();
  const allServers = [...new Set([...servers, ...PUBLIC_DNS_SERVERS])];
  dns.setServers(allServers);
  
  console.log('DNS Servers configured:', dns.getServers());
}

export async function testMongoDBConnectivity() {
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);
  
  try {
    // Test basic domain resolution
    const addresses = await resolver.resolve4('griefbridge.6ezbenv.mongodb.net');
    console.log('✓ MongoDB domain resolved:', addresses);
    return true;
  } catch (error) {
    console.warn('⚠ MongoDB domain resolution failed:', error.message);
    return false;
  }
}
