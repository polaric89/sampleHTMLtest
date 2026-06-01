# sampleHTMLtest

Sample custom page scripts for CustomerCentral portal injection.

## Usage

In the CustomerCentral Settings portal → Menu → Add Custom Page → GitHub URL, paste the raw URL to any `.js` file in this repo.

The script has access to:
- `window.ccPortal.endpoint` — CustomerCentral Suitelet URL
- `window.ccPortal.customerId` — current customer's NetSuite internal ID
- `window.ccPortal.customer` — full customer object already loaded by the portal

Render your UI into `#cc-custom-container`.
# sampleHTMLtest
