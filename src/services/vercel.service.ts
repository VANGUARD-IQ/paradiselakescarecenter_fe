/**
 * Vercel Domains API Service
 * Documentation: https://vercel.com/docs/rest-api/endpoints/domains
 */

interface VercelConfig {
  token: string;
  teamId?: string;
}

export interface VercelDomain {
  name: string;
  verified: boolean;
  createdAt: number;
  expiresAt?: number;
  boughtAt?: number;
  transferredAt?: number;
  transferStartedAt?: number;
  orderedAt?: number;
  nameservers?: string[];
  intendedNameservers?: string[];
  customNameservers?: string[];
}

export interface DNSRecord {
  id?: string;
  type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export class VercelService {
  private apiUrl = 'https://api.vercel.com';
  private config: VercelConfig;

  constructor(config: VercelConfig) {
    this.config = config;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
    };
  }

  private getTeamQuery() {
    return this.config.teamId ? `?teamId=${this.config.teamId}` : '';
  }

  /**
   * Check domain availability and pricing
   */
  async checkAvailability(domain: string): Promise<{ available: boolean; price?: number }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v4/domains/buy${this.getTeamQuery()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      
      const data = await response.json();
      
      // Check if domain is available for purchase
      const domainInfo = data.domains?.find((d: any) => d.name === domain);
      
      return {
        available: domainInfo?.available || false,
        price: domainInfo?.price || null
      };
    } catch (error) {
      console.error('Vercel availability check error:', error);
      throw error;
    }
  }

  /**
   * Purchase a domain
   */
  async purchaseDomain(domain: string, years: number = 1): Promise<{ success: boolean; domain: VercelDomain }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v5/domains/buy${this.getTeamQuery()}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            name: domain,
            years,
            expectedPrice: null, // Let Vercel determine the price
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to purchase domain: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        domain: data.domain
      };
    } catch (error) {
      console.error('Vercel domain purchase error:', error);
      throw error;
    }
  }

  /**
   * Add an existing domain to Vercel project
   */
  async addDomain(projectId: string, domain: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v10/projects/${projectId}/domains${this.getTeamQuery()}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            name: domain,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to add domain: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Vercel add domain error:', error);
      throw error;
    }
  }

  /**
   * List all domains
   */
  async listDomains(): Promise<VercelDomain[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v5/domains${this.getTeamQuery()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to list domains: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.domains || [];
    } catch (error) {
      console.error('Vercel list domains error:', error);
      throw error;
    }
  }

  /**
   * Get domain configuration
   */
  async getDomain(domain: string): Promise<VercelDomain> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v5/domains/${domain}${this.getTeamQuery()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get domain: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.domain;
    } catch (error) {
      console.error('Vercel get domain error:', error);
      throw error;
    }
  }

  /**
   * Get DNS records for a domain
   */
  async getDNSRecords(domain: string): Promise<DNSRecord[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v2/domains/${domain}/records${this.getTeamQuery()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get DNS records: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Vercel get DNS records error:', error);
      throw error;
    }
  }

  /**
   * Create a DNS record
   */
  async createDNSRecord(domain: string, record: DNSRecord): Promise<DNSRecord> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v2/domains/${domain}/records${this.getTeamQuery()}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(record),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create DNS record: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Vercel create DNS record error:', error);
      throw error;
    }
  }

  /**
   * Update a DNS record
   */
  async updateDNSRecord(domain: string, recordId: string, record: Partial<DNSRecord>): Promise<DNSRecord> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v2/domains/${domain}/records/${recordId}${this.getTeamQuery()}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(record),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update DNS record: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Vercel update DNS record error:', error);
      throw error;
    }
  }

  /**
   * Delete a DNS record
   */
  async deleteDNSRecord(domain: string, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v2/domains/${domain}/records/${recordId}${this.getTeamQuery()}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to delete DNS record: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Vercel delete DNS record error:', error);
      throw error;
    }
  }

  /**
   * Transfer domain to Vercel
   */
  async transferDomain(domain: string, authCode: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v1/domains/transfer-in${this.getTeamQuery()}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            name: domain,
            authCode,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to transfer domain: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Vercel transfer domain error:', error);
      throw error;
    }
  }

  /**
   * Configure domain nameservers
   */
  async updateNameservers(domain: string, nameservers: string[]): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v1/domains/${domain}/nameservers${this.getTeamQuery()}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            nameservers,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update nameservers: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Vercel update nameservers error:', error);
      throw error;
    }
  }

  /**
   * Verify domain ownership
   */
  async verifyDomain(domain: string): Promise<{ verified: boolean; txtRecord?: string }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v6/domains/${domain}/verify${this.getTeamQuery()}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        return {
          verified: false,
          txtRecord: data.verificationRecord // TXT record to add for verification
        };
      }
      
      return { verified: true };
    } catch (error) {
      console.error('Vercel verify domain error:', error);
      throw error;
    }
  }
}

// Factory function to create Vercel service
export function createVercelService(token: string, teamId?: string): VercelService {
  return new VercelService({ token, teamId });
}

// Helper function to format DNS record for display
export function formatDNSRecord(record: DNSRecord): string {
  let formatted = `${record.type} ${record.name} ${record.value}`;
  
  if (record.ttl) {
    formatted += ` TTL: ${record.ttl}`;
  }
  
  if (record.priority) {
    formatted += ` Priority: ${record.priority}`;
  }
  
  return formatted;
}

// Helper function to validate domain name
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}