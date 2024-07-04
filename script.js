addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
  })
  
  async function handleRequest(event) {
    const request = event.request
    const { pathname, searchParams } = new URL(request.url)
  
    if (pathname === '/create') {
      const randomString = generateRandomString(8)
      if (request.method === 'GET') {
        return new Response(showForm(randomString), {
          headers: { 'Content-Type': 'text/html' }
        })
      }
  
      if (request.method === 'POST') {
        const formData = await request.formData()
        const url = formData.get('url')
        const note = formData.get('note')
        const colorDark = formData.get('colorDark')
        const colorLight = formData.get('colorLight')
        const gradientType = formData.get('gradientType')
        const gradientColor1 = formData.get('gradientColor1')
        const gradientColor2 = formData.get('gradientColor2')
        const size = formData.get('size')
        const margin = formData.get('margin')
        const correctLevel = formData.get('correctLevel')
        const logo = formData.get('logo') // Handle the uploaded logo file
        const dotStyle = formData.get('dotStyle')
        const cornerSquareStyle = formData.get('cornerSquareStyle')
        const cornerDotStyle = formData.get('cornerDotStyle')
        const randomString = formData.get('randomString')
  
        if (!validateURL(url)) {
          return new Response(showForm(randomString, 'Invalid URL. Please try again.'), {
            headers: { 'Content-Type': 'text/html' }
          })
        }
  
        let logoUrl = ''
        if (logo && logo.size > 0) {
          const arrayBuffer = await logo.arrayBuffer()
          const base64String = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          )
          logoUrl = `data:${logo.type};base64,${base64String}`
        }
  
        const data = {
          url,
          note,
          colorDark,
          colorLight,
          gradientType,
          gradientColor1,
          gradientColor2,
          size,
          margin,
          correctLevel,
          logoUrl,
          dotStyle,
          cornerSquareStyle,
          cornerDotStyle,
          visits: 0
        }
        await URL_MAP.put(randomString, JSON.stringify(data))
  
        const qrCodeUrl = `https://qr.nips.gg/${randomString}`
  
        return new Response(showQRCode(qrCodeUrl, randomString, data), {
          headers: { 'Content-Type': 'text/html' }
        })
      }
  
      return new Response('Method not allowed', { status: 405 })
    } else {
      const key = pathname.slice(1) // Remove leading slash
  
      if (key) {
        const storedValue = await URL_MAP.get(key)
        if (storedValue) {
          const data = JSON.parse(storedValue)
  
          if (searchParams.has('stats')) {
            const qrCodeUrl = `https://qr.nips.gg/${key}`
            return new Response(showStats(qrCodeUrl, key, data), {
              headers: { 'Content-Type': 'text/html' }
            })
          } else {
            data.visits += 1
            await URL_MAP.put(key, JSON.stringify(data))
            return Response.redirect(data.url, 302)
          }
        } else {
          return new Response('Not found', { status: 404 })
        }
      }
      return new Response('Not found', { status: 404 })
    }
  }
  
  function showForm(randomString, error = '') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Generator</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              color: #333;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            h1 {
              margin-top: 0;
            }
            form {
              display: flex;
              flex-direction: column;
            }
            label {
              margin-bottom: 5px;
            }
            input, select {
              margin-bottom: 10px;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            input[type="color"] {
              width: 100%;
              padding: 0;
              height: 40px;
              border: none;
              border-radius: 4px;
              background-color: transparent;
            }
            button {
              padding: 10px;
              background-color: #007bff;
              color: #fff;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover {
              background-color: #0056b3;
            }
            .error {
              color: red;
            }
            .qrcode-container {
              margin-top: 20px;
              display: flex;
              justify-content: center;
            }
            .hidden {
              display: none;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/qr-code-styling/lib/qr-code-styling.js"></script>
          <script>
            let qrCode;
            document.addEventListener('DOMContentLoaded', () => {
              qrCode = new QRCodeStyling({
                width: 256,
                height: 256,
                data: "https://qr.nips.gg/${randomString}",
                dotsOptions: {
                  color: "#000000",
                  type: "dots"
                },
                cornersSquareOptions: {
                  color: "#000000",
                  type: "square"
                },
                cornersDotOptions: {
                  color: "#000000",
                  type: "square"
                },
                backgroundOptions: {
                  color: "#ffffff"
                },
                imageOptions: {
                  crossOrigin: "anonymous",
                  margin: 5
                }
              });
  
              qrCode.append(document.getElementById('qrcode'));
  
              document.getElementById('colorDark').addEventListener('input', updateQRCode);
              document.getElementById('colorLight').addEventListener('input', updateQRCode);
              document.getElementById('gradientType').addEventListener('change', toggleGradientFields);
              document.getElementById('gradientColor1').addEventListener('input', updateQRCode);
              document.getElementById('gradientColor2').addEventListener('input', updateQRCode);
              document.getElementById('size').addEventListener('change', updateQRCode);
              document.getElementById('margin').addEventListener('input', updateQRCode);
              document.getElementById('correctLevel').addEventListener('change', updateQRCode);
              document.getElementById('dotStyle').addEventListener('change', updateQRCode);
              document.getElementById('cornerSquareStyle').addEventListener('change', updateQRCode);
              document.getElementById('cornerDotStyle').addEventListener('change', updateQRCode);
              document.getElementById('logo').addEventListener('input', updateQRCode);
  
              toggleGradientFields();
            });
  
            function toggleGradientFields() {
              const gradientType = document.getElementById('gradientType').value;
              const gradientFields = document.querySelectorAll('.gradient-field');
              gradientFields.forEach(field => {
                field.classList.toggle('hidden', gradientType === 'none');
              });
              updateQRCode();
            }
  
            function updateQRCode() {
              const url = "https://qr.nips.gg/${randomString}";
              const colorDark = document.getElementById('colorDark').value || "#000000";
              const colorLight = document.getElementById('colorLight').value || "#ffffff";
              const gradientType = document.getElementById('gradientType').value;
              const gradientColor1 = document.getElementById('gradientColor1').value;
              const gradientColor2 = document.getElementById('gradientColor2').value;
              const size = parseInt(document.getElementById('size').value) || 256;
              const margin = parseInt(document.getElementById('margin').value) || 5;
              const correctLevel = document.getElementById('correctLevel').value || "L";
              const dotStyle = document.getElementById('dotStyle').value || "dots";
              const cornerSquareStyle = document.getElementById('cornerSquareStyle').value || "square";
              const cornerDotStyle = document.getElementById('cornerDotStyle').value || "square";
              const logo = document.getElementById('logo').files[0];
  
              const dotsOptions = {
                type: dotStyle,
                ...(gradientType !== "none" && {
                  gradient: {
                    type: gradientType,
                    colorStops: [
                      { offset: 0, color: gradientColor1 },
                      { offset: 1, color: gradientColor2 }
                    ]
                  }
                }),
                ...(gradientType === "none" && {
                  color: colorDark
                })
              };
  
              const reader = new FileReader();
              reader.onload = function (event) {
                const logoUrl = event.target.result;
                qrCode.update({
                  width: size,
                  height: size,
                  data: url,
                  dotsOptions,
                  cornersSquareOptions: {
                    color: colorDark,
                    type: cornerSquareStyle
                  },
                  cornersDotOptions: {
                    color: colorDark,
                    type: cornerDotStyle
                  },
                  backgroundOptions: {
                    color: colorLight
                  },
                  image: logoUrl,
                  imageOptions: {
                    crossOrigin: "anonymous",
                    margin
                  }
                });
              };
  
              if (logo) {
                reader.readAsDataURL(logo);
              } else {
                qrCode.update({
                  width: size,
                  height: size,
                  data: url,
                  dotsOptions,
                  cornersSquareOptions: {
                    color: colorDark,
                    type: cornerSquareStyle
                  },
                  cornersDotOptions: {
                    color: colorDark,
                    type: cornerDotStyle
                  },
                  backgroundOptions: {
                    color: colorLight
                  },
                  image: '',
                  imageOptions: {
                    crossOrigin: "anonymous",
                    margin
                  }
                });
              }
            }
          </script>
        </head>
        <body>
          <div class="container">
            <h1>QR Code Generator</h1>
            ${error ? `<p class="error">${error}</p>` : ''}
            <form method="POST" action="/create" enctype="multipart/form-data">
              <input type="hidden" name="randomString" value="${randomString}">
              <label for="url">Enter URL:</label>
              <input type="text" id="url" name="url" required>
              <label for="note">Enter Note:</label>
              <input type="text" id="note" name="note">
              <label for="colorDark">QR Code Color:</label>
              <input type="color" id="colorDark" name="colorDark" value="#000000">
              <label for="colorLight">Background Color:</label>
              <input type="color" id="colorLight" name="colorLight" value="#ffffff">
              <label for="gradientType">Gradient Type:</label>
              <select id="gradientType" name="gradientType">
                <option value="none" selected>None</option>
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
              <div class="gradient-field">
                <label for="gradientColor1">Gradient Color 1:</label>
                <input type="color" id="gradientColor1" name="gradientColor1" value="#000000">
              </div>
              <div class="gradient-field">
                <label for="gradientColor2">Gradient Color 2:</label>
                <input type="color" id="gradientColor2" name="gradientColor2" value="#000000">
              </div>
              <label for="size">Size:</label>
              <select id="size" name="size">
                <option value="128">Small</option>
                <option value="256" selected>Medium</option>
                <option value="512">Large</option>
              </select>
              <label for="margin">Margin:</label>
              <input type="number" id="margin" name="margin" value="5">
              <label for="correctLevel">Error Correction Level:</label>
              <select id="correctLevel" name="correctLevel">
                <option value="L">Low (L)</option>
                <option value="M" selected>Medium (M)</option>
                <option value="Q">Quartile (Q)</option>
                <option value="H">High (H)</option>
              </select>
              <label for="dotStyle">Dot Style:</label>
              <select id="dotStyle" name="dotStyle">
                <option value="dots" selected>Dots</option>
                <option value="rounded">Rounded</option>
                <option value="classy">Classy</option>
                <option value="classy-rounded">Classy Rounded</option>
                <option value="square">Square</option>
                <option value="extra-rounded">Extra Rounded</option>
              </select>
              <label for="cornerSquareStyle">Corner Square Style:</label>
              <select id="cornerSquareStyle" name="cornerSquareStyle">
                <option value="square" selected>Square</option>
                <option value="dot">Dot</option>
                <option value="extra-rounded">Extra Rounded</option>
              </select>
              <label for="cornerDotStyle">Corner Dot Style:</label>
              <select id="cornerDotStyle" name="cornerDotStyle">
                <option value="square" selected>Square</option>
                <option value="dot">Dot</option>
                <option value="extra-rounded">Extra Rounded</option>
              </select>
              <label for="logo">Logo (optional):</label>
              <input type="file" id="logo" name="logo" accept="image/*">
              <button type="submit">Generate QR Code</button>
            </form>
            <div class="qrcode-container">
              <div id="qrcode"></div>
            </div>
          </div>
        </body>
      </html>
    `
  }
  
  function showQRCode(qrCodeUrl, randomString, data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Generated</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              color: #333;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              margin-top: 0;
            }
            img {
              margin: 20px 0;
            }
            a {
              color: #007bff;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/qr-code-styling/lib/qr-code-styling.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              const qrCode = new QRCodeStyling({
                width: ${data.size},
                height: ${data.size},
                data: "${qrCodeUrl}",
                dotsOptions: {
                  color: "${data.colorDark}",
                  type: "${data.dotStyle}"
                },
                cornersSquareOptions: {
                  color: "${data.colorDark}",
                  type: "${data.cornerSquareStyle}"
                },
                cornersDotOptions: {
                  color: "${data.colorDark}",
                  type: "${data.cornerDotStyle}"
                },
                backgroundOptions: {
                  color: "${data.colorLight}"
                },
                image: "${data.logoUrl}" || undefined,
                imageOptions: {
                  crossOrigin: "anonymous",
                  margin: ${data.margin}
                }
              });
  
              qrCode.append(document.getElementById('qrcode'));
            });
          </script>
        </head>
        <body>
          <div class="container">
            <h1>Your QR Code</h1>
            <div id="qrcode"></div>
            <p>Random String: ${randomString}</p>
            <p>Note: ${data.note}</p>
            <p>Use the following links:</p>
            <p><a href="${qrCodeUrl}">Visit the URL</a></p>
            <p><a href="${qrCodeUrl}?stats">View Stats</a></p>
          </div>
        </body>
      </html>
    `
  }
  
  function showStats(qrCodeUrl, randomString, data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Stats</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              color: #333;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              margin-top: 0;
            }
            img {
              margin: 20px 0;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/qr-code-styling/lib/qr-code-styling.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              const qrCode = new QRCodeStyling({
                width: ${data.size},
                height: ${data.size},
                data: "${qrCodeUrl}",
                dotsOptions: {
                  color: "${data.colorDark}",
                  type: "${data.dotStyle}"
                },
                cornersSquareOptions: {
                  color: "${data.colorDark}",
                  type: "${data.cornerSquareStyle}"
                },
                cornersDotOptions: {
                  color: "${data.colorDark}",
                  type: "${data.cornerDotStyle}"
                },
                backgroundOptions: {
                  color: "${data.colorLight}"
                },
                image: "${data.logoUrl}" || undefined,
                imageOptions: {
                  crossOrigin: "anonymous",
                  margin: ${data.margin}
                }
              });
  
              qrCode.append(document.getElementById('qrcode'));
            });
          </script>
        </head>
        <body>
          <div class="container">
            <h1>QR Code Stats</h1>
            <div id="qrcode"></div>
            <p>Random String: ${randomString}</p>
            <p>Note: ${data.note}</p>
            <p>Visits: ${data.visits}</p>
          </div>
        </body>
      </html>
    `
  }
  
  function validateURL(url) {
    try {
      new URL(url)
      return true
    } catch (_) {
      return false
    }
  }
  
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }
  