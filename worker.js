export default {
  async fetch(request) {

    const url = new URL(request.url)

    // 🔐 token protection
    if (url.searchParams.get("token") !== "abc123") {
      return new Response("Forbidden", { status: 403 })
    }

    // 🔍 allow only Clash clients
    const ua = request.headers.get("User-Agent") || ""

    const allowedUA = [
      "Clash",
      "clash",
      "Meta",
      "FiClash",
      "Stash",
      "okhttp"
    ]

    if (!allowedUA.some(a => ua.includes(a))) {
      return new Response("404 Not Found", { status: 404 })
    }

    // =========================
    // 📦 PROXY LIST ENDPOINT
    // =========================
    if (url.pathname === "/proxies") {

      const proxies = `
proxies:
  - name: FTP1
    type: http
    server: 103.198.132.93
    port: 2610

  - name: FTP2
    type: http
    server: 103.198.133.138
    port: 2610

  - name: proxy1
    type: http
    server: 144.48.108.121
    port: 5452

  - name: proxy2
    type: http
    server: 144.48.108.122
    port: 5452

  - name: proxy3
    type: http
    server: 203.76.108.222
    port: 27271

  - name: proxy4
    type: http
    server: 103.167.17.220
    port: 2610

  - name: proxy6
    type: http
    server: 203.76.112.42
    port: 27271

  - name: proxy7
    type: http
    server: 203.76.115.98
    port: 27271

  - name: proxy8
    type: http
    server: 203.76.123.234
    port: 27271

  - name: proxy9
    type: http
    server: 27.147.221.155
    port: 27271

  - name: proxy10
    type: http
    server: 203.76.126.162
    port: 27271
`

      return new Response(proxies, {
        headers: { "Content-Type": "text/plain" }
      })
    }

    // =========================
    // ⚡ MAIN CONFIG
    // =========================
    const config = `
proxy-providers:
  myprovider:
    type: http
    url: "${url.origin}/proxies?token=abc123"
    interval: 3600
    path: ./proxies.yaml
    health-check:
      enable: true
      url: http://www.gstatic.com/generate_204
      interval: 60

proxy-groups:

  - name: STABLE
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    use:
      - myprovider

  - name: LOAD-BALANCE
    type: load-balance
    strategy: round-robin
    url: http://www.gstatic.com/generate_204
    interval: 60
    use:
      - myprovider

  - name: ALL
    type: select
    use:
      - myprovider

  - name: SELECTOR🔥
    type: select
    proxies:
      - STABLE
      - LOAD-BALANCE
      - ALL

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
`

    return new Response(config, {
      headers: { "Content-Type": "text/plain" }
    })
  }
}
