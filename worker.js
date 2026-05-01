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
  - {name: proxy1, type: http, server: 144.48.108.121, port: 5452}
  - {name: proxy2, type: http, server: 144.48.108.122, port: 5452}
  - {name: proxy3, type: http, server: 203.76.108.222, port: 27271}
  - {name: proxy4, type: http, server: 103.167.17.220, port: 2610}
  - {name: proxy5, type: http, server: 27.147.195.166, port: 27271}
  - {name: proxy6, type: http, server: 203.76.112.42, port: 27271}
  - {name: proxy7, type: http, server: 203.76.115.98, port: 27271}
  - {name: proxy8, type: http, server: 203.76.123.234, port: 27271}
  - {name: proxy9, type: http, server: 27.147.195.166, port: 27271}
  - {name: proxy10, type: http, server: 203.76.126.162, port: 27271}
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

  # ⚡ Load balance
  - name: LOAD-BALANCE
    type: load-balance
    strategy: round-robin
    url: http://www.gstatic.com/generate_204
    interval: 60
    use:
      - myprovider

  # 🎯 Manual control
  - name: ALL
    type: select
    use:
      - myprovider

  # 🚀 Final selector
  - name: SPEED🔥
    type: select
    proxies:
      - LOAD-BALANCE
      - ALL

rules:
  - DOMAIN-SUFFIX,googlevideo.com,SPEED🔥
  - DOMAIN-SUFFIX,youtube.com,SPEED🔥
  - DOMAIN-SUFFIX,gstatic.com,SPEED🔥
  - DOMAIN-SUFFIX,googleapis.com,SPEED🔥
  - DOMAIN-SUFFIX,cloudflare.com,SPEED🔥
  - DOMAIN-SUFFIX,akamaihd.net,SPEED🔥
  - DOMAIN-SUFFIX,fastly.net,SPEED🔥
  - DOMAIN-SUFFIX,cdn.jsdelivr.net,SPEED🔥
  - MATCH,SPEED🔥
`

    return new Response(config, {
      headers: { "Content-Type": "text/plain" }
    })
  }
}
