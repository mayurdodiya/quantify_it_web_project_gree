import crypto from "crypto";

class Base {
  protected mapIp(ip: string): string {
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }

    if (ip.includes(":")) {
      const hash = crypto.createHash("sha256").update(ip).digest("hex");

      const pseudoIpv4 = `${parseInt(hash.substr(0, 2), 16) & 0xff}.${parseInt(hash.substr(2, 2), 16) & 0xff}.${parseInt(hash.substr(4, 2), 16) & 0xff}.${parseInt(hash.substr(6, 2), 16) & 0xff}`;
      return pseudoIpv4;
    }

    return ip;
  }
}

class NetworkUtils extends Base {
  public getMappedIp(ip: string): string {
    return this.mapIp(ip);
  }
}

export const networkUtils = new NetworkUtils();
