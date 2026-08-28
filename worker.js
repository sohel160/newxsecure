export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 🔐 Token protection
    if (url.searchParams.get("token") !== "abc123") {
      return new Response("Forbidden", { status: 403 });
    }

    // 🔍 Allow Clash / FiClash / Mihomo clients
    const ua = request.headers.get("User-Agent") || "";

    const allowedUA = [
      "Clash",
      "clash",
      "Meta",
      "FiClash",
      "Stash",
      "okhttp",
      "mihomo",
      "ClashMeta",
      "Clash.Meta"
    ];

    if (!allowedUA.some(a => ua.includes(a))) {
      return new Response("404 Not Found", { status: 404 });
    }

    // ==================== PROXIES ENDPOINT ====================
    if (url.pathname === "/proxies") {
      const proxiesYaml = `
proxies:

  # ==================== ORIGINAL HTTP PROXIES ====================

  - name: "HTTP-1"
    type: http
    server: 103.84.39.92
    port: 3258

  - name: "HTTP-2"
    type: http
    server: 103.84.39.95
    port: 3258

  - name: "HTTP-3"
    type: http
    server: 103.84.39.94
    port: 3258

  - name: "HTTP-4"
    type: http
    server: 103.84.39.113
    port: 3258

  - name: "HTTP-5"
    type: http
    server: 103.84.39.161
    port: 6258

  - name: "HTTP-6"
    type: http
    server: 103.84.36.225
    port: 52148

  - name: "HTTP-7"
    type: http
    server: 103.84.36.237
    port: 22622

  - name: "HTTP-10"
    type: http
    server: 103.84.39.93
    port: 3258

  - name: "HTTP-11"
    type: http
    server: 103.192.159.17
    port: 6258

  - name: "HTTP-12"
    type: http
    server: 113.212.109.12
    port: 6258

  - name: "HTTP-13"
    type: http
    server: 113.212.109.193
    port: 6258



`;

      return new Response(proxiesYaml.trim(), {
        headers: {
          "Content-Type": "text/yaml; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    // ==================== MAIN CONFIG ====================

    const config = `
mixed-port: 7890
allow-lan: true
mode: rule
log-level: info

dns:
  enable: true
  ipv6: false
  enhanced-mode: fake-ip
  nameserver:
    - 1.1.1.1
    - 8.8.8.8

proxy-providers:
  myprovider:
    type: http
    url: "${url.origin}/proxies?token=abc123"
    path: ./proxies.yaml
    interval: 3600
    health-check:
      enable: true
      url: https://www.gstatic.com/generate_204
      interval: 180
      tolerance: 200

proxy-groups:

  - name: SELECTOR🔥
    type: select
    proxies:
      - LOAD-BALANCE
      - STABLE

  - name: STABLE
    type: url-test
    use:
      - myprovider
    url: https://www.gstatic.com/generate_204
    interval: 300
    tolerance: 150

  - name: LOAD-BALANCE
    type: load-balance
    strategy: round-robin
    use:
      - myprovider
    url: https://www.gstatic.com/generate_204
    interval: 10
    tolerance: 100

  - name: ALL
    type: select
    use:
      - myprovider

rules:
  - DOMAIN-SUFFIX,googlevideo.com,SELECTOR🔥
  - DOMAIN-SUFFIX,youtube.com,SELECTOR🔥
  - DOMAIN-SUFFIX,gstatic.com,SELECTOR🔥
  - DOMAIN-SUFFIX,googleapis.com,SELECTOR🔥
  - DOMAIN-SUFFIX,cloudflare.com,SELECTOR🔥
  - DOMAIN-SUFFIX,akamaihd.net,SELECTOR🔥
  - DOMAIN-SUFFIX,fastly.net,SELECTOR🔥
  - DOMAIN-SUFFIX,cdn.jsdelivr.net,SELECTOR🔥
  - MATCH,SELECTOR🔥
`;

    return new Response(config.trim(), {
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }
};
