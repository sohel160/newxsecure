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
  - { name: "HTTP-01", type: http, server: 103.115.242.157, port: 2610 }
  - { name: "HTTP-02", type: http, server: 103.115.242.1, port: 7860 }
  - { name: "HTTP-03", type: http, server: 180.149.232.85, port: 2610 }
  - { name: "HTTP-04", type: http, server: 180.149.235.128, port: 2610 }
  - { name: "HTTP-05", type: http, server: 103.69.150.3, port: 2908 }
  - { name: "HTTP-06", type: http, server: 103.69.150.34, port: 4884 }
  - { name: "HTTP-07", type: http, server: 103.69.150.24, port: 7258 }
  - { name: "HTTP-08", type: http, server: 103.69.150.75, port: 7852 }
  - { name: "HTTP-09", type: http, server: 103.69.150.77, port: 7840 }
  - { name: "HTTP-10", type: http, server: 103.109.96.65, port: 7860 }
  - { name: "HTTP-11", type: http, server: 103.69.150.75, port: 7852 }
  - { name: "HTTP-12", type: http, server: 203.188.255.21, port: 11611 }
`

      return new Response(proxies, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
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

  - name: SELECTOR🔥
    type: select
    proxies:
      - LOAD-BALANCE
      - STABLE

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

rules:
  # Google services → DIRECT
  - DOMAIN-SUFFIX,google.com,DIRECT
  - DOMAIN-SUFFIX,googleapis.com,DIRECT
  - DOMAIN-SUFFIX,gstatic.com,DIRECT
  - DOMAIN-SUFFIX,googlevideo.com,DIRECT
  - DOMAIN-SUFFIX,youtube.com,DIRECT
  - DOMAIN-SUFFIX,ytimg.com,DIRECT
  - DOMAIN-SUFFIX,ggpht.com,DIRECT
  - DOMAIN-SUFFIX,gvt1.com,DIRECT
  - DOMAIN-SUFFIX,gvt2.com,DIRECT
  - DOMAIN-SUFFIX,gvt3.com,DIRECT
  - DOMAIN-SUFFIX,android.com,DIRECT
  - DOMAIN-SUFFIX,gmail.com,DIRECT
  - DOMAIN-SUFFIX,googleusercontent.com,DIRECT

  # Chrome
  - DOMAIN-SUFFIX,chrome.com,DIRECT
  - DOMAIN-SUFFIX,chromium.org,DIRECT
  - DOMAIN-SUFFIX,googlezip.net,DIRECT

  # Firefox
  - DOMAIN-SUFFIX,mozilla.org,DIRECT
  - DOMAIN-SUFFIX,mozilla.com,DIRECT
  - DOMAIN-SUFFIX,mozilla.net,DIRECT
  - DOMAIN-SUFFIX,firefox.com,DIRECT
  - DOMAIN-SUFFIX,firefox.net,DIRECT

  # Everything else
  - MATCH,SELECTOR🔥
`

    return new Response(config, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    })
  }
}
