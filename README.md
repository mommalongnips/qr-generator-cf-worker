# QR Code Generator Cloudflare Worker

This Cloudflare Worker script allows users to generate customized QR codes with various styling options, including gradients, logo images, and more. The generated QR codes can be used to redirect to specified URLs and track visit statistics.

## Features

- Customizable QR code styling:
  - Dots color and style
  - Gradient options for dots
  - Background color
  - Corner squares and dots styles
  - Margin size
  - Error correction level
  - QR code size (small, medium, large)
  - Logo image
- Tracks the number of visits to each QR code
- Displays visit statistics and QR code details
- Dynamic form adjustments based on user selections

## Getting Started

### Prerequisites

- A Cloudflare account
- Cloudflare Workers enabled on your account
- A Cloudflare KV namespace for storing URL mappings and visit counts

### Setup

1. **Create a KV Namespace**

   In your Cloudflare dashboard, create a KV namespace for storing URL mappings and visit counts. Note the namespace ID.

2. **Deploy the Worker**

   In your Cloudflare dashboard, navigate to the Workers section and create a new Worker. Copy the provided script into the Worker editor.

3. **Bind the KV Namespace**

   Bind the KV namespace to the Worker script:
   - In the Worker script's settings, add a KV Namespace binding.
   - Use the name `URL_MAP` and bind it to your previously created KV Namespace.

4. **Deploy the Worker**

   Deploy the Worker in your Cloudflare dashboard.

### Usage

1. **Generate a QR Code**

   Visit the Worker URL with the path `/create` to access the QR code generation form. Enter the desired URL, note, and customize the QR code using the available options.

2. **View and Use the QR Code**

   After generating the QR code, you'll be provided with a URL and the QR code image. You can use this URL to redirect to the specified URL and track visits.

3. **View Visit Statistics**

   Append `?stats` to the generated URL to view visit statistics and QR code details.

### Example

**Generate a QR Code**

