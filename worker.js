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
  - {name: "FTP_01", type: socks5, server: 103.179.155.84, port: 9168, username: "u0a6309cf4e11", password: "-nYl6DiOoBBJ3g3O"}
  - {name: "FTP_02", type: socks5, server: 103.179.155.84, port: 9168, username: "u0a6309cf4e11", password: "-nYl6DiOoBBJ3g3O"}
  
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
